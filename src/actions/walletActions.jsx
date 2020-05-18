import {
  estimateMultisigTransactionFee,
  satoshisToBitcoins,
} from "unchained-bitcoin";

import BigNumber from "bignumber.js";
import { fetchAddressUTXOs } from "../blockchain";
import { isChange } from "../utils/slices";
import { naiveCoinSelection } from "../utils";
import {
  setBalanceError,
  setChangeOutput,
  setInputs,
  setFee,
  finalizeOutputs,
} from "./transactionActions";
import { getSpendableSlices } from "../selectors/wallet";

export const UPDATE_DEPOSIT_SLICE = "UPDATE_DEPOSIT_SLICE";
export const UPDATE_CHANGE_SLICE = "UPDATE_CHANGE_SLICE";
export const RESET_NODES_SPEND = "RESET_NODES_SPEND";
export const UPDATE_WALLET_NAME = "UPDATE_WALLET_NAME";
export const UPDATE_WALLET_MODE = "UPDATE_WALLET_MODE";
export const RESET_WALLET_VIEW = "RESET_WALLET_VIEW";
export const RESET_WALLET = "RESET_WALLET";
export const SPEND_SLICES = "SPEND_SLICES";
export const INITIAL_LOAD_COMPLETE = "INITIAL_LOAD_COMPLETE";
export const RESET_NODES_FETCH_ERRORS = "RESET_NODES_FETCH_ERRORS";

export const WALLET_MODES = {
  VIEW: 0,
  DEPOSIT: 1,
  SPEND: 2,
};

export function updateDepositSliceAction(value) {
  return {
    type: UPDATE_DEPOSIT_SLICE,
    value: {
      ...value,
      ...{ change: false },
    },
  };
}

export function updateChangeSliceAction(value) {
  return {
    type: UPDATE_CHANGE_SLICE,
    value: {
      ...value,
      ...{ change: true },
    },
  };
}

export function resetNodesSpend() {
  return {
    type: RESET_NODES_SPEND,
  };
}

/**
 * @description This dispatcher goes through the necessary steps and dispatching
 * related actions for the process of selecting coins for a transaction.
 * 1. Get all spendable slices that can be used for inputs
 * 2. Select the utxos needed to fund the tx and determine if change is needed
 * 3. Set a change output if necessary
 * 4. Determine and set fee
 * 5. Mark all slices being spent so the store is aware that they've been selected
 */
export function autoSelectCoins() {
  // eslint-disable-next-line consistent-return
  return (dispatch, getState) => {
    const {
      settings,
      spend: { transaction },
      wallet: {
        change: {
          nextNode: {
            multisig: { address: changeAddress },
          },
        },
      },
    } = getState();
    const { totalSigners: n, requiredSigners: m, addressType } = settings;
    const { outputs, feeRate: feesPerByteInSatoshis } = transaction;
    const spendableSlices = getSpendableSlices(getState());

    let selectedUtxos;
    let changeRequired;

    // select coins and catch error if any occurs during selection
    try {
      [selectedUtxos, changeRequired] = naiveCoinSelection({
        outputs,
        feesPerByteInSatoshis,
        m,
        n,
        addressType,
        slices: spendableSlices,
      });
    } catch (e) {
      return dispatch(setBalanceError(e.message));
    }

    // determine fee based on rate, selected utxos and
    // if change output is required
    let fee;
    const options = {
      addressType,
      numInputs: selectedUtxos.length,
      m,
      n,
      feesPerByteInSatoshis,
    };

    // add change output if necessary and make fee calculation
    if (changeRequired) {
      // calculate output, input, and fee totals to determine change amount
      const outputsTotal = outputs.reduce(
        (total, output) => total.plus(output.amountSats),
        new BigNumber(0)
      );
      const inputsTotalSats = selectedUtxos.reduce(
        (total, utxo) => total.plus(utxo.amountSats),
        new BigNumber(0)
      );
      fee = estimateMultisigTransactionFee({
        ...options,
        numOutputs: outputs.length + 1,
      });

      const changeAmount = inputsTotalSats
        .minus(fee)
        .minus(outputsTotal)
        .toFixed(8);

      dispatch(
        setChangeOutput({
          address: changeAddress,
          value: satoshisToBitcoins(changeAmount).toFixed(),
        })
      );
    } else {
      fee = estimateMultisigTransactionFee({
        ...options,
        numOutputs: outputs.length,
      });
    }

    dispatch(setFee(satoshisToBitcoins(fee).toFixed()));
    // set chosen selectedUtxos in the transaction store
    dispatch(setInputs(selectedUtxos));
    dispatch(finalizeOutputs(true));
  };
}

export function spendSlices(inputs, changeSlice) {
  return async (dispatch, getState) => {
    const {
      settings: { network },
      client,
      spend: {
        transaction: { changeAddress },
      },
    } = getState();

    const sliceUpdates = [];

    // track which slices are already being queried since
    // the fetch command will get all utxos for an address.
    const addressSet = new Set();
    const fetchSliceStatus = async (address, bip32Path) => {
      const utxos = await fetchAddressUTXOs(address, network, client);
      return {
        addressUsed: true,
        change: isChange(bip32Path),
        bip32Path,
        ...utxos,
      };
    };

    inputs.forEach((input) => {
      const { address } = input.multisig;
      if (!addressSet.has(address)) {
        addressSet.add(address);
        // setting up async network calls to await all of them
        sliceUpdates.push(fetchSliceStatus(address, input.bip32Path));
      }
    });

    // if we have a change slice, then let's query an update for
    // that slice too
    if (changeSlice && changeSlice.multisig.address === changeAddress) {
      addressSet.add(changeAddress);
      sliceUpdates.push(fetchSliceStatus(changeAddress, changeSlice.bip32Path));
    }

    const updatedSlices = await Promise.all(sliceUpdates);

    updatedSlices.forEach((slice) => {
      if (slice.change)
        dispatch({
          type: UPDATE_CHANGE_SLICE,
          value: slice,
        });
      else
        dispatch({
          type: UPDATE_DEPOSIT_SLICE,
          value: slice,
        });
    });
  };
}

export function setWalletModeAction(value) {
  return {
    type: UPDATE_WALLET_MODE,
    value,
  };
}

export function updateWalletNameAction(number, value) {
  return {
    type: UPDATE_WALLET_NAME,
    value,
  };
}

export function resetWalletView() {
  return {
    type: RESET_WALLET_VIEW,
  };
}

export function resetWallet() {
  return {
    type: RESET_WALLET,
  };
}

export function initialLoadComplete() {
  return {
    type: INITIAL_LOAD_COMPLETE,
  };
}

export function resetNodesFetchErrors() {
  return {
    type: RESET_NODES_FETCH_ERRORS,
  };
}
