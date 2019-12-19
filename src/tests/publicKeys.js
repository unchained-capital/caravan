import React from "react";
import {
  MAINNET,
  TESTNET,
} from "unchained-bitcoin";
import {
  ExportPublicKey,
} from "unchained-wallets";

import Test from "./Test";

class ExportPublicKeyTest extends Test {

  description() {
    return (<p>Export a public key at BIP32 path <code>{this.params.bip32Path}</code>.</p>);
  }
  
  interaction() {
    return ExportPublicKey({
      walletType: this.params.walletType, 
      network: this.params.network,
      bip32Path: this.params.bip32Path,
    });
  }

  postprocess(result) {
    return (result.pubkey ? result.pubkey :  result);
  }

}

const publicKeyTests = (walletType) => ([
  new ExportPublicKeyTest({
    name: "Multisig P2SH Mainnet Public Key",
    walletType, 
    network: MAINNET, 
    bip32Path: "m/45'/0'/0'/0/0", 
    expected: "03102f0df5e34ffa1178a5310952221b8e26b3e761a9e328832c750a2de252f21a",
  }),
  new ExportPublicKeyTest({
    name: "Multisig P2SH Testnet Public Key",
    walletType, 
    network: TESTNET, 
    bip32Path: "m/45'/1'/0'/0/0",
    expected: "037226e92491b2cf9691152fc2e9a0a7cff8f9ab7ad1b24b6f6506d7c8bf18911b",
  }),
  new ExportPublicKeyTest({
    name: "Multisig P2SH-P2WSH Mainnet Public Key",
    walletType, 
    network: MAINNET, 
    bip32Path: "m/48'/0'/0'/1'/0/0",
    expected: "02c63c7ae511c9902e885da3e2fbb4a8f227eefc7f53eda3cad4d8f9389331b5be",
  }),
  new ExportPublicKeyTest({
    name: "Multisig P2SH-P2WSH Testnet Public Key",
    walletType, 
    network: TESTNET, 
    bip32Path: "m/48'/1'/0'/1'/0/0",
    expected: "03ff8a79f5016243a3959e2216e51cf90034cf510b379a34e6fdf565b19852baa2",
  }),
  new ExportPublicKeyTest({
    name: "Multisig P2WSH Mainnet Public Key",
    walletType, 
    network: MAINNET, 
    bip32Path: "m/48'/0'/0'/2'/0/0",
    expected: "032817ba5e2b76f6e2fab1d985224516f2b77a9c181e210def81ec2be8e17007c9",
  }),
  new ExportPublicKeyTest({
    name: "Multisig P2WSH Testnet Public Key",
    walletType, 
    network: TESTNET, 
    bip32Path: "m/48'/1'/0'/2'/0/0",
    expected: "03ecf349ecf63fcd0ece9de7eb1abfb8f8b243fecc443bd62ef47744f0f6b7eef6",
  }),

]);

export default publicKeyTests;
