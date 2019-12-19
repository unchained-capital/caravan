import {LEDGER} from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import signingTests from "./signing";

export default publicKeyTests(LEDGER).concat(signingTests(LEDGER));
