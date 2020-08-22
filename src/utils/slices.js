import { DEFAULT_CHANGE_PREFIX, CHANGE_INDEX } from "./constants";

const initSortDir = (order) => (order === "asc" ? -1 : 1);

/**
 * Function to compare two slices and determine sort
 * order by BIP32 path
 * @param {object} a - slice a for comparison
 * @param {object} b - slice b for comparison
 * @param {string} [orderDir = "asc"] - direction for ordering (desc or asc)
 */
export function compareSlicesByPath(a, b, orderDir = "asc") {
  if (!a.bip32Path && !b.bip32Path)
    throw new Error("Mising BIP32 path for comparing slices.");

  const direction = initSortDir(orderDir);

  if (a.change && !b.change) return direction;
  if (!a.change && b.change) return -direction;
  const aint = parseInt(a.bip32Path.split("/").reverse()[0], 10);
  const bint = parseInt(b.bip32Path.split("/").reverse()[0], 10);
  return aint > bint ? direction : -direction;
}

/**
 * Function to compare two slices and determine sort
 * order by balance
 * @param {object} a - slice a for comparison
 * @param {object} b - slice b for comparison
 * @param {string} [orderDir = "asc"] - direction for ordering (desc or asc)
 */
export function compareSlicesByBalance(a, b, orderDir = "asc") {
  if (!a.balanceSats && !b.balanceSats)
    throw new Error("Missing balance for comparing slices");

  const direction = initSortDir(orderDir);

  if (a.balanceSats.isEqualTo(b.balanceSats)) return 0;
  return a.balanceSats.isGreaterThan(b.balanceSats) ? direction : -direction;
}

/**
 * Function to compare two slices and determine sort
 * order by total UTXO count
 * @param {object} a - slice a for comparison
 * @param {object} b - slice b for comparison
 * @param {string} [orderDir = "asc"] - direction for ordering (desc or asc)
 */
export function compareSlicesByUTXOCount(a, b, orderDir = "asc") {
  if (!a.utxos && !b.utxos)
    throw new Error("Missing utxo array for comparing slices");
  const direction = initSortDir(orderDir);
  if (a.utxos.length === b.utxos.length) return 0;
  return a.utxos.length > b.utxos.length ? direction : -direction;
}

/**
 * Function to compare two slices and determine sort
 * order by lastUsed time
 * @param {object} a - slice a for comparison
 * @param {object} b - slice b for comparison
 * @param {string} [orderDir = "asc"] - direction for ordering (desc or asc)
 * @returns {number}
 */
export function compareSlicesByTime(a, b, orderDir = "asc") {
  const direction = initSortDir(orderDir);
  if (!a.utxos && !b.utxos && !a.lastUsed && !b.lastUsed) return 0;

  // when ascending, spent is after unused but before used and unspent
  if (a.lastUsed === "Spent")
    return b.lastUsed && b.lastUsed !== "Spent" ? -direction : direction;
  if (b.lastUsed === "Spent")
    return a.lastUsed && a.lastUsed !== "Spent" ? direction : -direction;

  // if there is a lastUsedTime param then we should be able to compare those
  if (a.lastUsedTime && b.lastUsedTime) {
    if (a.lastUsedTime === b.lastUsedTime) return 0;
    return a.lastUsedTime >= b.lastUsedTime ? direction : -direction;
  }

  if (a.lastUsedTime && (!b.lastUsedTime || b.utxos.length === 0)) {
    return direction;
  }

  if (b.lastUsedTime && (!a.lastUsedTime || a.utxos.length === 0)) {
    return -direction;
  }

  if (a.utxos.length === 0) {
    return b.utxos.length === 0 ? 0 : direction;
  }
  if (b.utxos.length === 0) {
    return a.utxos.length === 0 ? 0 : -direction;
  }
  const amax = Math.max(...a.utxos.map((utxo) => utxo.time));
  const bmax = Math.max(...b.utxos.map((utxo) => utxo.time));

  if (Number.isNaN(amax) && Number.Number.isNaN(bmax)) return 0;
  if (Number.isNaN(amax)) return direction;
  if (Number.isNaN(bmax)) return -direction;
  return amax > bmax ? direction : -direction;
}

export function isChange(path) {
  // if the prefix matches the change prefix
  // and there is only 1 more index after, then it is change
  const prefixLength = DEFAULT_CHANGE_PREFIX.length;
  if (
    path.slice(0, prefixLength) === DEFAULT_CHANGE_PREFIX &&
    // this checks that the only thing after the change prefix is an index
    path.slice(prefixLength).match(/^([0-9]+)$/g)
  )
    return true;

  // if the last two indexes are not hardened and the second to last
  // index in the path is the change index, then it is change
  const pathIndexMatcher = /\/([0-9]+('?))/g;
  const indexes = path.match(pathIndexMatcher).slice(-2);

  // eslint-disable-next-line no-restricted-syntax
  for (const index of indexes) {
    // neither of the final two indexes should be hardened
    // if it is change
    if (index.includes("'")) return false;
  }

  // if two matching indexes found and first is change, e.g. /1/0
  // then it is change
  if (indexes[0] === CHANGE_INDEX && indexes.length === 2) return true;
  return false;
}
