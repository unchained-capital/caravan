import { LEDGER } from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import extendedPublicKeyTests from "./extendedPublicKeys";
import { signingTests } from "./signing";

export default publicKeyTests(LEDGER)
  .concat(extendedPublicKeyTests(LEDGER))
  .concat(signingTests(LEDGER));
