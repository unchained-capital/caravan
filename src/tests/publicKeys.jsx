import React from "react";
import { Network, TEST_FIXTURES } from "unchained-bitcoin";
import { COLDCARD, ExportPublicKey, HERMIT } from "unchained-wallets";

import Test from "./Test";

class ExportPublicKeyTest extends Test {
  // eslint-disable-next-line class-methods-use-this
  postprocess(result) {
    return result.pubkey ? result.pubkey : result;
  }

  name() {
    return `Export ${this.params.network} public key at ${this.params.bip32Path}`;
  }

  description() {
    return (
      <p>
        Export a public key at BIP32 path <code>{this.params.bip32Path}</code>.
      </p>
    );
  }

  interaction() {
    return ExportPublicKey({
      keystore: this.params.keystore,
      network: this.params.network,
      bip32Path: this.params.bip32Path,
      includeXFP: true,
    });
  }

  expected() {
    const { pub, rootFingerprint } =
      TEST_FIXTURES.keys.open_source.nodes[this.params.bip32Path];
    if (this.params.keystore === HERMIT) {
      return pub;
    }
    return { publicKey: pub, rootFingerprint };
  }
}

const publicKeyTests = (keystore) => {
  switch (keystore) {
    case COLDCARD:
      return [
        new ExportPublicKeyTest({
          keystore,
          network: Network.TESTNET,
          bip32Path: "m/48'/1'/0'/1'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.TESTNET,
          bip32Path: "m/48'/1'/0'/2'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.MAINNET,
          bip32Path: "m/48'/0'/0'/1'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.MAINNET,
          bip32Path: "m/48'/0'/0'/2'/0/0",
        }),
      ];
    default:
      return [
        new ExportPublicKeyTest({
          keystore,
          network: Network.TESTNET,
          bip32Path: "m/45'/1'/0'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.TESTNET,
          bip32Path: "m/48'/1'/0'/1'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.TESTNET,
          bip32Path: "m/48'/1'/0'/2'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.MAINNET,
          bip32Path: "m/45'/0'/0'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.MAINNET,
          bip32Path: "m/48'/0'/0'/1'/0/0",
        }),
        new ExportPublicKeyTest({
          keystore,
          network: Network.MAINNET,
          bip32Path: "m/48'/0'/0'/2'/0/0",
        }),
      ];
  }
};

export default publicKeyTests;
