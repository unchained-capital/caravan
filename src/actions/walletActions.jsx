import { fetchAddressUTXOs } from "../blockchain";
import { isChange } from "../utils/slices";

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
