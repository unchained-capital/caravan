import BigNumber from "bignumber.js";
import { satoshisToBitcoins } from "unchained-bitcoin";

export const DUST_IN_BTC = satoshisToBitcoins(BigNumber(546));
export const DEFAULT_PREFIX = "m";
export const CHANGE_INDEX = "/1";
export const DEFAULT_CHANGE_PREFIX = DEFAULT_PREFIX + CHANGE_INDEX;
