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
import { setErrorNotification } from "./errorNotificationActions";
import { getSpendableSlices } from "../selectors/wallet";

export const UPDATE_DEPOSIT_SLICE = "UPDATE_DEPOSIT_SLICE";
export const UPDATE_CHANGE_SLICE = "UPDATE_CHANGE_SLICE";
export const RESET_NODES_SPEND = "RESET_NODES_SPEND";
export const UPDATE_WALLET_NAME = "UPDATE_WALLET_NAME";
export const UPDATE_WALLET_UUID = "UPDATE_WALLET_UUID";
export const UPDATE_WALLET_MODE = "UPDATE_WALLET_MODE";
export const RESET_WALLET_VIEW = "RESET_WALLET_VIEW";
export const RESET_WALLET = "RESET_WALLET";
export const SPEND_SLICES = "SPEND_SLICES";
export const INITIAL_LOAD_COMPLETE = "INITIAL_LOAD_COMPLETE";
export const RESET_NODES_FETCH_ERRORS = "RESET_NODES_FETCH_ERRORS";
export const UPDATE_POLICY_REGISTRATIONS = "UPDATE_POLICY_REGISTRATION";

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
          value: satoshisToBitcoins(changeAmount),
        })
      );
    } else {
      fee = estimateMultisigTransactionFee({
        ...options,
        numOutputs: outputs.length,
      });
    }

    dispatch(setFee(satoshisToBitcoins(fee)));
    // set chosen selectedUtxos in the transaction store
    dispatch(setInputs(selectedUtxos));
    dispatch(finalizeOutputs(true));
  };
}

/**
 * @description Given the state of the transaction store, check status of
 * the slices being used in the spend tx and update them once changed state is confirmed.
 * @param {Object} changeSlice - the slice that was chosen as the change output
 * @param {number} retries - number of retries
 * @param {Set} skipAddresses - set of addresses to skip
 */
export function updateTxSlices(
  changeSlice,
  retries = 10,
  skipAddresses = new Set()
) {
  // eslint-disable-next-line consistent-return
  return async (dispatch, getState) => {
    const {
      settings: { network },
      client,
      spend: {
        transaction: { changeAddress, inputs, txid },
      },
      wallet: {
        deposits: { nextNode: nextDepositSlice, nodes: depositSlices },
        change: { nodes: changeSlices },
      },
    } = getState();

    // utility function for getting utxo set of an address
    // and formatting the result in a way we can use
    const fetchSliceStatus = async (address, bip32Path) => {
      const utxos = await fetchAddressUTXOs(address, network, client);
      return {
        addressUsed: true,
        change: isChange(bip32Path),
        address,
        bip32Path,
        ...utxos,
      };
    };

    // array of slices we want to query
    const slices = [...inputs];

    // if there is a change address in the transaction
    // then we want to query the state of that slice as well
    if (changeSlice && changeSlice.multisig.address === changeAddress) {
      slices.push(changeSlice);
    }

    // array to store results from queries for each slice
    const sliceUpdates = [];

    // track which slices are already being queried since
    // the fetch command will get all utxos for an address
    // and some inputs might be for the same address
    const addressSet = new Set();

    // go through each slice and see if it needs to be queried
    slices.forEach((slice) => {
      const { address } = slice.multisig;
      // if address isn't already being queried and isn't in the
      // set of addresses to skip (which means it's already been
      // successfully updated), then fetchSliceStatus
      if (!addressSet.has(address) && !skipAddresses.has(address)) {
        addressSet.add(address);
        // setting up async network calls to await all of them
        sliceUpdates.push(fetchSliceStatus(address, slice.bip32Path));
      }
    });

    let queriedSlices;
    try {
      queriedSlices = await Promise.all(sliceUpdates);
    } catch (e) {
      return dispatch(
        setErrorNotification(
          `There was a problem updating wallet state. Try a refresh. Error: ${e.message}`
        )
      );
    }

    // once all queries have completed we can confirm which have been updated
    // and dispatch the changes to the store
    for (let i = 0; i < queriedSlices.length; i += 1) {
      const slice = queriedSlices[i];
      const utxoCount = slice.change
        ? changeSlices[slice.bip32Path].utxos.length
        : depositSlices[slice.bip32Path].utxos.length;

      // if the utxo count is not the same then we can reliably update
      // this slice and can skip in any future calls
      if (slice && slice.utxos && slice.utxos.length !== utxoCount) {
        dispatch({
          type: slice.change ? UPDATE_CHANGE_SLICE : UPDATE_DEPOSIT_SLICE,
          value: slice,
        });
        skipAddresses.add(slice.address);
      }
    }

    // if not all slices queried were successful, then we want to recursively call
    // updateTxSlices, counting down retries and with the full set of successful queries
    // ALL input slices must return a different utxo set otherwise something went wrong
    if (skipAddresses.size !== queriedSlices.length && retries)
      return setTimeout(
        () => dispatch(updateTxSlices(changeSlice, retries - 1, skipAddresses)),
        750
      );

    // if we're out of retries and counts are still the same
    // then we're done trying and should show an error
    if (!retries) {
      let message = `There was a problem updating the wallet balance.
      It is recommended you refresh the wallet to make sure UTXO current set is up to date.`;
      if (txid && txid.length) message += ` Transaction ID: ${txid}`;
      return dispatch(setErrorNotification(message));
    }

    // Check the next deposit slice just in case a spend is to own wallet.
    // This doesn't catch all self-spend cases but should catch the majority
    // to avoid any confusion for less technical users.
    const updatedSlice = await fetchSliceStatus(
      nextDepositSlice.multisig.address,
      nextDepositSlice.bip32Path
    );

    // if its status has changed and the utxo set for the next
    // deposit slice is different, then update it as well
    if (
      updatedSlice.utxos.length !==
      depositSlices[updatedSlice.bip32Path].utxos.length
    )
      return dispatch({ type: UPDATE_DEPOSIT_SLICE, value: updatedSlice });
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

export function updateWalletUuidAction(value) {
  return {
    type: UPDATE_WALLET_UUID,
    value,
  };
}

export function updateWalletPolicyRegistrationsAction({ xfp, policyHmac }) {
  return {
    type: UPDATE_POLICY_REGISTRATIONS,
    value: {
      xfp,
      policyHmac,
    },
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
