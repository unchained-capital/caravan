import { HERMET } from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import extendedPublicKeyTests from "./extendedPublicKeys";
import { signingTests } from "./signing";

export default publicKeyTests(HERMET)
  .concat(extendedPublicKeyTests(HERMET))
  .concat(signingTests(HERMET));
