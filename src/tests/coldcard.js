import { COLDCARD } from "unchained-wallets";

import extendedPublicKeyTests from "./extendedPublicKeys";
import { signingTests } from "./signing";
import publicKeyTests from "./publicKeys";

export default publicKeyTests(COLDCARD)
  .concat(extendedPublicKeyTests(COLDCARD))
  .concat(signingTests(COLDCARD));
