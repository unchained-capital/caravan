import { createSelector } from 'reselect'

// convert slice objects to array of slice values
// only care about inbound to deposit account, not change
const getDepositSlices = state => Object.values(state.wallet.deposits.nodes)
const getWalletSlices = state => [...Object.values(state.wallet.deposits.nodes), ...Object.values(state.wallet.change.nodes)]

export const getPendingBalance = createSelector(
  getDepositSlices,
  // iterate through all slices to add up the pending balance
  (slices) => {
    // reduce slices to calculate unconfirmed utxos from each slice
    return slices.reduce((balance, currentSlice) => {
        // if the current slice has no UTXOs, then continue
        if (!currentSlice.utxos.length) return balance
        // otherwise, loop through available utxos and add balance of those
        // that are unconfirmed
        const sliceBalance = currentSlice.utxos.reduce((total, utxo) => {
          if (!utxo.confirmed) return total + parseInt(utxo.amountSats, 10)
          return total
        }, 0)

        // add slice's pending balance to aggregated balance
        return sliceBalance + balance
      }, 0)
  }
)

export const getUnknownAddressSlices = createSelector(
  getWalletSlices, 
  slices => slices.filter(slice => !slice.addressKnown)
);

export const getUnknownAddresses = createSelector(
  [getWalletSlices, getUnknownAddressSlices], 
  nodes => nodes.map(slice => slice.multisig.address)
);