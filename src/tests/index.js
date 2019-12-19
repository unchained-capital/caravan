import {
  TREZOR,
  LEDGER,
  HERMIT,
} from "unchained-wallets";

import trezorTests from "./trezor";
import ledgerTests from "./ledger";
import hermitTests from "./hermit";

const SUITE = {};

SUITE[TREZOR] = trezorTests;
SUITE[LEDGER] = ledgerTests;
SUITE[HERMIT] = hermitTests;

const SEED = [
  'merge',
  'alley',
  'lucky',
  'axis',
  'penalty',
  'manage',
  'latin',
  'gasp',
  'virus',
  'captain',
  'wheel',
  'deal',
  'chase',
  'fragile',
  'chapter',
  'boss',
  'zero',
  'dirt',
  'stadium',
  'tooth',
  'physical',
  'valve',
  'kid',
  'plunge',
];

export {
  SUITE,
  SEED,
};
