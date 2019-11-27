import {
  UPDATE_AUTO_SPEND,
  UPDATE_VIEW_ADDRESSES,
  UPDATE_DEPOSITING,
  UPDATE_SPENDING,
  UPDATE_WALLET_NAME,
  RESET_WALLET_VIEW,
} from "../actions/walletActions"
import { updateState } from './utils';

const initialState = {
  autoSpend: true,
  viewAddresses: false,
  depositing: false,
  spending: false,
  walletName: "My Multisig Wallet",
};

function resetWalletViews(state) {
  return updateState(state, {
    spending: false,
    depositing: false,
    viewAddresses: false,
  });
}

function setUnique(state, key) {
  const newState = resetWalletViews(state);
  newState[key] = true;
  return newState;
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_AUTO_SPEND:
      return updateState(state, { autoSpend: action.value });
    case UPDATE_DEPOSITING:
      return setUnique(state, 'depositing');
    case UPDATE_SPENDING:
      return setUnique(state, 'spending');
    case UPDATE_VIEW_ADDRESSES:
      return setUnique(state, 'viewAddresses');
    case UPDATE_WALLET_NAME:
      return updateState(state, { walletName: action.value });
    case RESET_WALLET_VIEW:
      return resetWalletViews(state);
    default:
      return state;
  }
};
