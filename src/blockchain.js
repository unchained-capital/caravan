import { sortInputs } from "unchained-bitcoin";
import BigNumber from "bignumber.js";
import {
  blockExplorerGetAddresesUTXOs,
  blockExplorerGetFeeEstimate,
  blockExplorerBroadcastTransaction,
  blockExplorerGetAddressStatus,
} from "./block_explorer";
import {
  bitcoindListUnspent,
  bitcoindEstimateSmartFee,
  bitcoindSendRawTransaction,
  bitcoindParams,
  bitcoindGetAddressStatus,
  isWalletAddressNotFoundError,
} from "./bitcoind";

export const BLOCK_EXPLORER = "public";
export const BITCOIND = "private";

function fetchAddressUTXOsUnsorted(address, network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerGetAddresesUTXOs(address, network);
  }
  return bitcoindListUnspent({
    ...bitcoindParams(client),
    ...{ address },
  });
}

/**
 * Fetch utxos for an address, calculate total balances
 * and return an object describing the addresses state
 * @param {string} address
 * @param {string} network
 * @param {object} client
 * @returns {object} slice object with information gathered for that address
 */
export async function fetchAddressUTXOs(address, network, client) {
  let unsortedUTXOs;

  let updates = {
    utxos: [],
    balanceSats: BigNumber(0),
    fetchedUTXOs: false,
    fetchUTXOsError: "",
  };
  try {
    unsortedUTXOs = await fetchAddressUTXOsUnsorted(address, network, client);
  } catch (e) {
    if (client.type === "private" && isWalletAddressNotFoundError(e)) {
      updates = {
        utxos: [],
        balanceSats: BigNumber(0),
        addressKnown: false,
        fetchedUTXOs: true,
        fetchUTXOsError: "",
      };
    } else {
      updates = { fetchUTXOsError: e.toString() };
    }
  }

  // if no utxos then return updates object as is
  if (!unsortedUTXOs) return updates;

  // sort utxos
  const utxos = sortInputs(unsortedUTXOs);

  // calculate the total balance from all utxos
  const balanceSats = utxos
    .map((utxo) => utxo.amountSats)
    .reduce(
      (accumulator, currentValue) => accumulator.plus(currentValue),
      new BigNumber(0)
    );

  return {
    ...updates,
    balanceSats,
    utxos,
    fetchedUTXOs: true,
    fetchUTXOsError: "",
  };
}

export function getAddressStatus(address, network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerGetAddressStatus(address, network);
  }
  return bitcoindGetAddressStatus({
    ...bitcoindParams(client),
    ...{ address },
  });
}

export function fetchFeeEstimate(network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerGetFeeEstimate(network);
  }
  return bitcoindEstimateSmartFee({
    ...bitcoindParams(client),
    ...{ numBlocks: 1 },
  });
}

export function broadcastTransaction(transactionHex, network, client) {
  if (client.type === BLOCK_EXPLORER) {
    return blockExplorerBroadcastTransaction(transactionHex, network);
  }
  return bitcoindSendRawTransaction({
    ...bitcoindParams(client),
    ...{ hex: transactionHex },
  });
}
