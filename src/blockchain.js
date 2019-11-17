import {
  blockExplorerGetAddresesUTXOs,
  blockExplorerGetFeeEstimate,
  blockExplorerBroadcastTransaction,
} from "./block_explorer";
import {
  bitcoindListUnspent,
  bitcoindEstimateSmartFee,
  bitcoindSendRawTransaction,
} from "./bitcoind";

export const BLOCK_EXPLORER = 'public';
export const BITCOIND = 'private';

export function bitcoindParams(client) {
  const {url, username, password} = client;
  const auth = { username, password };
  return {url, auth};
}

export function fetchAddressUTXOs(address, network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerGetAddresesUTXOs(address, network);
  } else {
    return bitcoindListUnspent({
      ...bitcoindParams(client),
      ...{address}
    });
  }
}

export function fetchFeeEstimate(network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerGetFeeEstimate(network);
  } else {
    return bitcoindEstimateSmartFee({
      ...bitcoindParams(client),
      ...{numBlocks: 1}
    });
  }
}

export function broadcastTransaction(transactionHex, network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerBroadcastTransaction(transactionHex, network);
  } else {
    return bitcoindSendRawTransaction({
      ...bitcoindParams(client),
      ...{hex: transactionHex}
    });
  }
}
