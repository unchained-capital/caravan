import React from "react";
import {
  MAINNET,
  TESTNET,
  P2SH,
  generateMultisigFromHex,
  blockExplorerAddressURL,
} from "unchained-bitcoin";
import {ConfirmMultisigAddress} from "unchained-wallets";
import {externalLink} from "../utils";

import Test from "./Test";

import {Box} from "@material-ui/core";

class ConfirmMultisigAddressTest extends Test {

  description() {
    return (
      <Box>
        <p>Confirm the 2-of-2 {this.params.addressType} address {externalLink(blockExplorerAddressURL(this.params.address, this.params.network), <code>{this.params.address}</code>)} at BIP32 path <code>{this.params.bip32Path}</code>.</p>
      </Box>
    );
  }
  
  interaction() {
    return ConfirmMultisigAddress({
      walletType: this.params.walletType, 
      network: this.params.network,
      bip32Path: this.params.bip32Path,
      multisig: generateMultisigFromHex(this.params.network, this.params.addressType, this.params.redeemScript),
    });
  }

}

const addressTests = (walletType) => ([
  new ConfirmMultisigAddressTest({
    name: "Confirm Multisig P2SH Mainnet Address",
    walletType, 
    network: MAINNET, 
    addressType: P2SH,
    redeemScript: "522102583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace792102b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a52ae",
    address: "3PiCF26aq57Wo5DJEbFNTVwD1bLCUEpAYZ",
    bip32Path: "m/45'/0'/100'/0/0",
    expected: true,
  }),
]);

export default addressTests;
