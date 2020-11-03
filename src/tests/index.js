import { TREZOR, LEDGER, HERMIT, COLDCARD } from "unchained-wallets";
import { TEST_FIXTURES } from "unchained-bitcoin";

import trezorTests from "./trezor";
import ledgerTests from "./ledger";
import hermitTests from "./hermit";
import coldcardTests from "./coldcard";

const SUITE = {};

SUITE[TREZOR] = trezorTests;
SUITE[LEDGER] = ledgerTests;
SUITE[HERMIT] = hermitTests;
SUITE[COLDCARD] = coldcardTests;

const SEED = TEST_FIXTURES.bip39Phrase;

export { SUITE, SEED };
