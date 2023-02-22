import { TREZOR } from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import extendedPublicKeyTests from "./extendedPublicKeys";
import addressTests from "./addresses";
import { signingTests } from "./signing";

export default publicKeyTests(TREZOR)
  .concat(extendedPublicKeyTests(TREZOR))
  .concat(signingTests(TREZOR))
  .concat(addressTests(TREZOR));
