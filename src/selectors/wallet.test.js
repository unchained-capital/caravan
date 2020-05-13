import BigNumber from "bignumber.js";

import {
  getConfirmedBalance,
  getTotalbalance,
  getPendingBalance,
  getSpendableSlices,
} from "./wallet";

import { getMockState } from "../utils/fixtures";

describe("wallet selectors", () => {
  let state;
  let confirmedBalance;
  let pendingBalance;
  beforeEach(() => {
    confirmedBalance = 5000;
    pendingBalance = 1000;
    state = getMockState({ confirmedBalance, pendingBalance });
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
      // add unused slice to make sure it's not included
      state.wallet.deposits.nodes.push({
        utxos: [],
        balanceSats: new BigNumber(0),
      });
      const actuallySpendable = getSpendableSlices(state);

      actuallySpendable.forEach((slice) => {
        expect(slice.utxos.length).toBeGreaterThan(0);
        slice.utxos.forEach((utxo) => expect(utxo.confirmed).toBeTruthy());
        expect(slice.lastUsed !== "Pending").toBeTruthy();
      });
    });
  });
});
