import { createSelector } from "reselect";

// convert slice objects to array of slice values
// only care about inbound to deposit account, not change
const getDepositSlices = (state) => Object.values(state.wallet.deposits.nodes);
const getWalletSlices = (state) => [
  ...Object.values(state.wallet.deposits.nodes),
  ...Object.values(state.wallet.change.nodes),
];

const getAddressType = (state) => state.settings.addressType;
const getNetwork = (state) => state.settings.network;
const getTotalSigners = (state) => state.settings.totalSigners;
const getRequiredSigners = (state) => state.settings.requiredSigners;
const getStartingAddressIndex = (state) => state.settings.startingAddressIndex;
const getWalletName = (state) => state.wallet.common.walletName;
const getWalletUuid = (state) => state.wallet.common.walletUuid;
const getExtendedPublicKeyImporters = (state) =>
  state.quorum.extendedPublicKeyImporters;
const getWalletLedgerPolicyHmacs = (state) =>
  state.wallet.common.ledgerPolicyHmacs;
const getClientDetails = (state) => {
  if (state.client.type === "private") {
    return `{
    "type": "private",
    "url": "${state.client.url}",
    "username": "${state.client.username}"
  }`;
  }
  return `{
    "type": "public"
  }`;
};

const extendedPublicKeyImporterBIP32Path = (state, number) => {
  const { extendedPublicKeyImporters } = state.quorum;
  const extendedPublicKeyImporter = extendedPublicKeyImporters[number];
  const bip32Path =
    extendedPublicKeyImporter.method === "text"
      ? "Unknown (make sure you have written this down previously!)"
      : extendedPublicKeyImporter.bip32Path;
  const rootFingerprint =
    extendedPublicKeyImporter.rootXfp === "Unknown"
      ? "00000000"
      : extendedPublicKeyImporter.rootXfp;
  return extendedPublicKeyImporter.method === "unknown"
    ? `    {
        "name": "${extendedPublicKeyImporter.name}",
        "bip32Path": "${bip32Path}",
        "xpub": "${extendedPublicKeyImporter.extendedPublicKey}",
        "xfp" : "${rootFingerprint}"
        }`
    : `    {
        "name": "${extendedPublicKeyImporter.name}",
        "bip32Path": "${bip32Path}",
        "xpub": "${extendedPublicKeyImporter.extendedPublicKey}",
        "xfp" : "${rootFingerprint}",
        "method": "${extendedPublicKeyImporter.method}"
      }`;
};

const getExtendedPublicKeysBIP32Paths = (state) => {
  const totalSigners = getTotalSigners(state);
  const extendedPublicKeyImporterBIP32Paths = [];
  for (let i = 1; i <= totalSigners; i += 1) {
    extendedPublicKeyImporterBIP32Paths.push(
      `${extendedPublicKeyImporterBIP32Path(state, i)}${
        i < totalSigners ? "," : ""
      }`
    );
  }
  return extendedPublicKeyImporterBIP32Paths.join("\n");
};

/**
 * @description cycle through all slices to calculate total balance of all utxos
 * from all slices including pending.
 */
export const getTotalBalance = createSelector(getWalletSlices, (slices) => {
  return slices.reduce((balance, slice) => {
    const sliceTotal = slice.utxos.reduce((total, utxo) => {
      return total + parseInt(utxo.amountSats, 10);
    }, 0);
    return balance + sliceTotal;
  }, 0);
});

export const getPendingBalance = createSelector(
  getDepositSlices,
  // iterate through all slices to add up the pending balance
  (slices) => {
    // reduce slices to calculate unconfirmed utxos from each slice
    return slices.reduce((balance, currentSlice) => {
      // if the current slice has no UTXOs, then continue
      if (!currentSlice.utxos.length) return balance;
      // otherwise, loop through available utxos and add balance of those
      // that are unconfirmed
      const sliceBalance = currentSlice.utxos.reduce((total, utxo) => {
        if (!utxo.confirmed) return total + parseInt(utxo.amountSats, 10);
        return total;
      }, 0);

      // add slice's pending balance to aggregated balance
      return sliceBalance + balance;
    }, 0);
  }
);

/**
 * @description selector that subtracts pending balance (calculated with
 * other selector) from total balance of each braid which is stored in the state
 */
export const getConfirmedBalance = createSelector(
  [getTotalBalance, getPendingBalance],
  (totalBalance, pendingBalance) => totalBalance - pendingBalance
);

/**
 * @description Returns a selector with all slices from both deposit and change braids
 * also adds a "lastUsed" property for each slice
 */
export const getSlicesWithLastUsed = createSelector(
  getWalletSlices,
  (slices) => {
    return slices.map((slice) => {
      if (!slice.utxos.length && slice.addressUsed)
        return { ...slice, lastUsed: "Spent" };

      // if no utxos and no recorded balanceSats then just return the slice unchanged
      if (!slice.utxos.length && slice.balanceSats.isEqualTo(0)) return slice;

      // find the last UTXO time for the last used time for that slice
      const maxtime = Math.max(...slice.utxos.map((utxo) => utxo.time));

      // if no max was able to be found, but we still have a balanceSats
      // then we can can assume the utxo is pending
      if (
        Number.isNaN(maxtime) ||
        (slice.balanceSats.isGreaterThan(0) && !slice.utxos.length)
      )
        return { ...slice, lastUsed: "Pending" };
      return {
        ...slice,
        lastUsed: new Date(1000 * maxtime).toLocaleDateString(),
        lastUsedTime: maxtime,
      };
    });
  }
);

/**
 * Gets the set of spendable slices, i.e. ones that don't have a
 * pending utxo and are not spent
 */
export const getSpendableSlices = createSelector(
  getSlicesWithLastUsed,
  (slices) => {
    return slices.filter(
      (slice) =>
        // pending change is considered spendable
        (slice.lastUsed !== "Pending" || slice.change) &&
        slice.lastUsed !== "Spent" &&
        slice.utxos.length
    );
  }
);

/**
 * @description Returns a selector that provides all spent slices, i.e.
 * All slices that have been used but have no balance left.
 */
export const getSpentSlices = createSelector(getSlicesWithLastUsed, (slices) =>
  slices.filter((slice) => slice.addressUsed && slice.balanceSats.isEqualTo(0))
);

/**
 * @description Returns a selector that provides all slices with an active balance
 */
export const getSlicesWithBalance = createSelector(
  getSlicesWithLastUsed,
  (slices) => slices.filter((slice) => slice.balanceSats.isGreaterThan(0))
);

/**
 * @description Returns a selector that provides all unused slices,
 * i.e. where the balance is zero and the address has not been used
 */
export const getZeroBalanceSlices = createSelector(
  getSlicesWithLastUsed,
  (slices) =>
    slices.filter(
      (slice) => slice.balanceSats.isEqualTo(0) && !slice.addressUsed
    )
);

/**
 * @description Returns a selector of all wallet slices
 * where the status of that slice is not known.
 */
export const getUnknownAddressSlices = createSelector(
  getWalletSlices,
  (slices) => slices.filter((slice) => !slice.addressKnown)
);

/**
 * @description returns an array of all addresses of slices
 * where the state of that slice is not known
 */
export const getUnknownAddresses = createSelector(
  [getWalletSlices, getUnknownAddressSlices],
  (slices) => slices.map((slice) => slice.multisig.address)
);

/**
 * @description Returns a selector of all slices from the _deposit_ braid
 * where the address hasn't been used yet.
 */
export const getDepositableSlices = createSelector(getDepositSlices, (slices) =>
  slices.filter((slice) => slice.balanceSats.isEqualTo(0) && !slice.addressUsed)
);

/**
 * @description Returns a selector of the text needed to construct a wallet
 * details file.
 */
export const getWalletDetailsText = createSelector(
  [
    getWalletName,
    getWalletUuid,
    getAddressType,
    getNetwork,
    getClientDetails,
    getRequiredSigners,
    getTotalSigners,
    getExtendedPublicKeysBIP32Paths,
    getStartingAddressIndex,
    getWalletLedgerPolicyHmacs,
  ],
  (
    walletName,
    walletUuid,
    addressType,
    network,
    clientDetails,
    requiredSigners,
    totalSigners,
    extendedPublicKeys,
    startingAddressIndex,
    ledgerPolicyHmacs = []
  ) => {
    return `{
  "name": "${walletName}",
  "uuid": "${walletUuid}",
  "addressType": "${addressType}",
  "network": "${network}",
  "client":  ${clientDetails},
  "quorum": {
    "requiredSigners": ${requiredSigners},
    "totalSigners": ${totalSigners}
  },
  "extendedPublicKeys": [
    ${extendedPublicKeys}
  ],
  "startingAddressIndex": ${startingAddressIndex},
  "ledgerPolicyHmacs": [${ledgerPolicyHmacs.map(JSON.stringify).join(", ")}]
}`;
  }
);

export const getWalletConfig = createSelector(
  [getWalletDetailsText],
  JSON.parse
);

export const getHmacsWithName = createSelector(
  getExtendedPublicKeyImporters,
  getWalletLedgerPolicyHmacs,
  (extendedPublicKeys, policyHmacs) => {
    return Object.values(extendedPublicKeys)
      .map((importer) => {
        const policyHmac = policyHmacs.find(
          (hmac) => hmac.xfp === importer.rootXfp
        )?.policyHmac;
        return { policyHmac, name: importer.name };
      })
      .filter((registration) => registration.policyHmac);
  }
);
