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
 */
export function compareSlicesByTime(a, b, orderDir = "asc") {
  if ((!a.utxos && !b.utxos) || (!a.lastUsed && !b.lastUsed))
    throw new Error(
      "Cannot compare slices, missing utxo list or lastUsed property"
    );
  const direction = initSortDir(orderDir);
  // if there is a last used param then we should be able to compare those
  if (a.lastUsed && b.lastUsed)
    return a.lastUsed >= b.lastUsed ? direction : -direction;

  if (a.utxos.length === 0) {
    return b.utxos.length === 0 ? 0 : direction;
  }
  if (b.utxos.length === 0) {
    return a.utxos.length === 0 ? 0 : -direction;
  }
  const amin = Math.min(...a.utxos.map((utxo) => utxo.time));
  const bmin = Math.min(...b.utxos.map((utxo) => utxo.time));
  if (Number.isNaN(amin) && Number.Number.isNaN(bmin)) return 0;
  if (Number.isNaN(amin)) return direction;
  if (Number.isNaN(bmin)) return -direction;
  return amin > bmin ? direction : -direction;
}
