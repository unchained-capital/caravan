import { HERMIT } from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import extendedPublicKeyTests from "./extendedPublicKeys";
import { signingTests } from "./signing";

export default publicKeyTests(HERMIT)
  .concat(extendedPublicKeyTests(HERMIT))
  .concat(signingTests(HERMIT));
