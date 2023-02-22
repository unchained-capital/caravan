import { LEDGER } from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import extendedPublicKeyTests from "./extendedPublicKeys";
import { signingTests } from "./signing";
import addressTests from "./addresses";
import registrationTests from "./registration";

export default publicKeyTests(LEDGER)
  .concat(extendedPublicKeyTests(LEDGER))
  .concat(signingTests(LEDGER))
  .concat(addressTests(LEDGER))
  .concat(registrationTests(LEDGER));
