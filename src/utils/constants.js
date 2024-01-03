import { satoshisToBitcoins } from "unchained-bitcoin";

export const DUST_IN_SATOSHIS = 546;
export const DUST_IN_BTC = satoshisToBitcoins(DUST_IN_SATOSHIS.toString());
export const DEFAULT_PREFIX = "m";
export const CHANGE_INDEX = "/1";
export const DEFAULT_CHANGE_PREFIX = DEFAULT_PREFIX + CHANGE_INDEX;
