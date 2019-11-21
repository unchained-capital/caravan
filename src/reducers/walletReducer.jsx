import {
  UPDATE_AUTO_SPEND,
  UPDATE_VIEW_ADDRESSES,
  UPDATE_DEPOSITING,
  UPDATE_SPENDING,
  UPDATE_WALLET_NAME,
} from "../actions/walletActions"
import { updateState } from './utils';

const initialState = {
  autoSpend: true,
  viewAddresses: false,
  depositing: false,
  spending: false,
  walletName: "My Multisig Wallet",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_AUTO_SPEND:
      return updateState(state, { autoSpend: action.value });
    case UPDATE_DEPOSITING:
      return updateState(state, { depositing: action.value, spending: !action.value });
    case UPDATE_SPENDING:
      return updateState(state, { spending: action.value, depositing: !action.value });
    case UPDATE_VIEW_ADDRESSES:
      return updateState(state, { viewAddresses: action.value });
    case UPDATE_WALLET_NAME:
      return updateState(state, { walletName: action.value });
    default:
      return state;
  }
};
