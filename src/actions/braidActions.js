import BigNumber from "bignumber.js";

import { updateDepositSliceAction, updateChangeSliceAction } from './walletActions'
import { fetchAddressUTXOs, getAddressStatus } from '../blockchain'
import { setErrorNotification } from './errorNotificationActions'

export const UPDATE_BRAID_SLICE = 'UPDATE_BRAID_SLICE'

/**
 * Given an array of slices from one or more braids,
 * query the utxos for that slice (i.e. at that address) and
 * check if the address is "used". Will then dispatch actions
 * to update the data for each slice
 * @param {array<object>} slices - array of slices from one or more braids
 */
export const fetchSliceData = async slices => {
  return async (dispatch, getState) => {
    const { network } = getState().settings
    const client = getState().client

    try {
      // Create a list of the async calls for updating the slice data.
      // This lets us run these requests in parallel with a Promise.all
      const sliceDataPromises = slices.map(slice => {
        const address = slice.multisig.address
        // creating a tuple of async calls that will need to be resolved
        // for each slice we're querying for
        return Promise.all([
          fetchAddressUTXOs(address, network, client), 
          getAddressStatus(address, network, client)
        ])
      })
  
      // wait until we've gotten the updates for each slice
      const queriedSlices = await Promise.all(sliceDataPromises)
  
      // each slice had two queries and should be in a tuple
      queriedSlices.forEach(([utxos, sliceStatus], index) => {
        // reference to the original slice object passed into action creator
        const slice = slices[index]

        // for each queried slice, we need to check if there are utxos
        // skip if no updates
        if (!utxos || !utxos.length) return
        // and create updated slice data for each 
        const balanceSats = utxos
          .map((utxo) => utxo.amountSats)
          .reduce(
            (accumulator, currentValue) => accumulator.plus(currentValue),
            new BigNumber(0));
        const updates = { 
          balanceSats, 
          utxos, 
          fetchedUTXOs: true, 
          fetchUTXOsError: '' 
        }
        const updater = (slice.change ? updateChangeSliceAction : updateDepositSliceAction);
        const updatedSlice = {
          bip32Path: slice.bip32Path,
          addressKnown: true,
          ...updates,
          sliceStatus,
        }
        dispatch(updater(updatedSlice));
      })
    } catch (e) {
      console.error('There was a problem getting updated braid data:', e.message)
      dispatch(setErrorNotification(e.message))
    }
  }
}