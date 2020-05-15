/* eslint-disable import/prefer-default-export */
/* eslint-disable no-param-reassign */
import BigNumber from "bignumber.js";

/**
 * Generate a mock state with some slices and utxos with balances
 * @param {Object} walletBalance
 * @param {number} walletBalance.confirmedBalance
 * @param {number} walletBalance.pendingBalance
 */
export function getMockState(walletBalance) {
  const {
    confirmedBalance,
    pendingBalance,
    numConfirmed = 5,
    numPending = 2,
  } = walletBalance;

  const utxosConfirmed = Array(numConfirmed).fill({
    confirmed: true,
    amountSats: new BigNumber(Math.floor(confirmedBalance / numConfirmed), 10),
    time: Date.now() - Math.floor(Math.random() * 10000),
  });

  const utxosUnconfirmed =
    numPending && pendingBalance
      ? Array(numPending).fill({
          confirmed: false,
          amountSats: new BigNumber(
            Math.floor(pendingBalance / numPending),
            10
          ),
        })
      : [];

  // we'll put half of the confirmed and unconfirme utxos in a deposit slice
  // and half in change.
  const state = {
    wallet: {
      deposits: {
        nodes: [
          {
            utxos: utxosConfirmed.slice(Math.floor(utxosConfirmed.length / 2)),
            change: false,
          },
          {
            utxos: utxosUnconfirmed.slice(
              Math.floor(utxosUnconfirmed.length / 2)
            ),
            change: false,
          },
        ],
      },
      change: {
        nodes: [
          {
            utxos: utxosConfirmed.slice(Math.ceil(utxosConfirmed.length / 2)),
            change: true,
          },
          {
            utxos: utxosUnconfirmed.slice(
              Math.ceil(utxosUnconfirmed.length / 2)
            ),
            change: true,
          },
        ],
      },
    },
  };

  // set slice balances
  state.wallet.deposits.nodes.forEach((slice) => {
    slice.balanceSats = slice.utxos.reduce(
      (balance, utxo) => balance.plus(utxo.amountSats),
      new BigNumber(0)
    );
  });

  state.wallet.change.nodes.forEach((slice) => {
    slice.balanceSats = slice.utxos.reduce(
      (balance, utxo) => balance.plus(utxo.amountSats),
      new BigNumber(0)
    );
  });
  return state;
}
