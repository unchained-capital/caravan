import {
  getConfirmedBalance,
  getTotalbalance,
  getPendingBalance,
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
});
