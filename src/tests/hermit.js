import {HERMIT} from "unchained-wallets";

import publicKeyTests from "./publicKeys";
import signingTests from "./signing";

export default publicKeyTests(HERMIT)
  .concat(signingTests(HERMIT).filter((test) => { return !test.segwit; }));
