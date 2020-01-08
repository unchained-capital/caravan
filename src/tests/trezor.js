import {TREZOR} from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import signingTests from "./signing";
import addressTests from "./addresses";

export default publicKeyTests(TREZOR).concat(signingTests(TREZOR)).concat(addressTests(TREZOR));
