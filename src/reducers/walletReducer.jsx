import {
  UPDATE_AUTO_SPEND,
  UPDATE_WALLET_NAME,
  RESET_WALLET_VIEW,
  WALLET_MODES,
  UPDATE_WALLET_MODE,
} from "../actions/walletActions"
import { updateState } from './utils';

const initialState = {
  walletMode: WALLET_MODES.VIEW,
  walletName: "My Multisig Wallet",
};

function resetWalletViews(state) {
  return updateState(state, {
    walletMode: WALLET_MODES.VIEW,
  });
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_WALLET_MODE:
      return updateState(state, {walletMode: action.value});
    case UPDATE_WALLET_NAME:
      return updateState(state, { walletName: action.value });
    case RESET_WALLET_VIEW:
      return resetWalletViews(state);
    default:
      return state;
  }
};
