/* eslint-disable import/prefer-default-export */
import BigNumber from "bignumber.js";
import { satoshisToBitcoins } from "unchained-bitcoin";

export const DUST_IN_BTC = satoshisToBitcoins(BigNumber(546));
