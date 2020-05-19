import { TREZOR, LEDGER, HERMIT } from "unchained-wallets";
import { TEST_FIXTURES } from "unchained-bitcoin";

import trezorTests from "./trezor";
import ledgerTests from "./ledger";
import hermitTests from "./hermit";

const SUITE = {};

SUITE[TREZOR] = trezorTests;
SUITE[LEDGER] = ledgerTests;
SUITE[HERMIT] = hermitTests;

const SEED = TEST_FIXTURES.bip39Phrase;

export { SUITE, SEED };
