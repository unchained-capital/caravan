/* eslint-disable no-param-reassign */
import BigNumber from "bignumber.js";

import {
  getConfirmedBalance,
  getTotalbalance,
  getPendingBalance,
  getSpendableSlices,
} from "./wallet";

describe("wallet selectors", () => {
  let state;
  let utxosConfirmed;
  let utxosUnconfirmed;
  let confirmedBalance;
  let pendingBalance;
  beforeEach(() => {
    confirmedBalance = 5000;
    pendingBalance = 1000;
    utxosConfirmed = Array(5).fill({
      confirmed: true,
      amountSats: confirmedBalance / 5,
      time: Date.now() - Math.floor(Math.random() * 10000),
    });
    utxosUnconfirmed = Array(2).fill({
      confirmed: false,
      amountSats: pendingBalance / 2,
    });

    // we'll put half of the confirmed utxos in a deposit slice
    // and half in change. All unconfirmed will go in one deposit slice
    state = {
      wallet: {
        deposits: {
          nodes: [
            {
              utxos: utxosConfirmed.slice(
                Math.floor(utxosConfirmed.length / 2)
              ),
            },
            {
              utxos: utxosUnconfirmed,
            },
          ],
        },
        change: {
          nodes: [
            {
              utxos: utxosConfirmed.slice(Math.ceil(utxosConfirmed.length / 2)),
            },
          ],
        },
      },
    };
    // set slice balances
    state.wallet.deposits.nodes.forEach((slice) => {
      slice.balanceSats = slice.utxos.reduce((balance, utxo) => {
        if (utxo.confirmed) balance.plus(utxo.amountSats);
        return balance;
      }, new BigNumber(0));
    });

    state.wallet.change.nodes.forEach((slice) => {
      slice.balanceSats = slice.utxos.reduce((balance, utxo) => {
        if (utxo.confirmed) balance.plus(utxo.amountSats);
        return balance;
      }, new BigNumber(0));
    });
  });
  describe("getPendingBalance", () => {
    it("should return total balance of unconfirmed UTXOs", () => {
      const actualPending = getPendingBalance(state);
      expect(actualPending).toEqual(pendingBalance);
    });
  });
  describe("getTotalBalance", () => {
    it("should return total balance of confirmed and unconfirmed UTXOs", () => {
      const actualTotal = getTotalbalance(state);
      expect(actualTotal).toEqual(pendingBalance + confirmedBalance);
    });
  });
  describe("getConfirmedBalance", () => {
    it("should return balance excluding pending utxos in satoshis", () => {
      const actualConfirmed = getConfirmedBalance(state);
      expect(actualConfirmed).toEqual(confirmedBalance);
    });
  });
  describe("getSpendableSlices", () => {
    it("should return slices that are neither pending or spent", () => {
      const actuallySpendable = getSpendableSlices(state);

      actuallySpendable.forEach((slice) => {
        slice.utxos.forEach((utxo) => expect(utxo.confirmed).toBeTruthy());
        expect(slice.lastUsed !== "Pending").toBeTruthy();
        expect(slice.utxos.length).toBeGreaterThan(0);
      });
    });
  });
});
