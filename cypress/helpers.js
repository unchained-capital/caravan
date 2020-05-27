import {
  MAINNET,
  PUBLIC_CLIENT_MAINNET_API,
  PUBLIC_CLIENT_TESTNET_API,
} from "./constants";

export const initialCap = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const getPublicClientBaseUrl = (network) => {
  if (network === MAINNET) {
    return PUBLIC_CLIENT_MAINNET_API;
  }
  return PUBLIC_CLIENT_TESTNET_API;
};

export const getTransactionUrl = (txid, network = MAINNET) =>
  `${getPublicClientBaseUrl(network)}/tx/${txid}`;

export const getAddressUrl = (address, network = MAINNET) =>
  `${getPublicClientBaseUrl(network)}/address/${address}`;

export default initialCap;
