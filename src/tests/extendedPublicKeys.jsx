import React from "react";
import { MAINNET, TESTNET, TEST_FIXTURES } from "unchained-bitcoin";
import { ExportExtendedPublicKey } from "unchained-wallets";

import Test from "./Test";

class ExportExtendedPublicKeyTest extends Test {
  // eslint-disable-next-line class-methods-use-this
  postprocess(result) {
    return result.pubkey ? result.pubkey : result;
  }

  name() {
    return `Export ${this.params.network} xpub at ${this.params.bip32Path}`;
  }

  description() {
    return (
      <p>
        Export an extended public key at BIP32 path{" "}
        <code>{this.params.bip32Path}</code>
      </p>
    );
  }

  interaction() {
    return ExportExtendedPublicKey({
      keystore: this.params.keystore,
      network: this.params.network,
      bip32Path: this.params.bip32Path,
    });
  }

  expected() {
    if (this.params.network === MAINNET)
      return TEST_FIXTURES.nodes[this.params.bip32Path].xpub;
    return TEST_FIXTURES.nodes[this.params.bip32Path].tpub;
  }
}

const extendedPublicKeyTests = (keystore) => [
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/0'",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/0'/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/0'/0/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/4'",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/4'/0/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/4'/6/2",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/4'/99'",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/4'/99'/0/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: TESTNET,
    bip32Path: "m/45'/0'/4'/99'/2147483647/3/1",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/0'",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/0'/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/0'/0/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/4'",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/4'/0/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/4'/6/2",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/4'/99'",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/4'/99'/0/0",
  }),
  new ExportExtendedPublicKeyTest({
    keystore,
    network: MAINNET,
    bip32Path: "m/45'/0'/4'/99'/2147483647/3/1",
  }),
];

export default extendedPublicKeyTests;
