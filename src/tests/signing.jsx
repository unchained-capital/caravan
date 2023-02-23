import React from "react";
import {
  blockExplorerAddressURL,
  satoshisToBitcoins,
  unsignedMultisigTransaction,
  unsignedMultisigPSBT,
  unsignedTransactionObjectFromPSBT,
  TEST_FIXTURES,
} from "unchained-bitcoin";
import {
  COLDCARD,
  HERMIT,
  LEDGER,
  SignMultisigTransaction,
  braidDetailsToWalletConfig,
} from "unchained-wallets";
import { Box, Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import { externalLink } from "../utils";
import Test from "./Test";

class SignMultisigTransactionTest extends Test {
  name() {
    return `Sign ${this.params.network} transaction w/ ${this.params.outputs.length} outputs and ${this.params.inputs.length} inputs`;
  }

  // eslint-disable-next-line class-methods-use-this
  postprocess(result) {
    return result.signatures ? result.signatures : result;
  }

  // eslint-disable-next-line class-methods-use-this
  matches(expected, actual) {
    return JSON.stringify(expected) === JSON.stringify(actual);
  }

  description() {
    return (
      <Box>
        <p>Sign a transaction which{this.params.description}.</p>
        <p>
          <small>
            This transaction is not meant to be broadcast, but just in case, the
            output address is fixed and owned by Unchained Capital.
          </small>
        </p>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Output Address:</TableCell>
              <TableCell>
                {externalLink(
                  blockExplorerAddressURL(
                    this.outputAddress(),
                    this.params.network
                  ),
                  <code>{this.outputAddress()}</code>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Output Amount:</TableCell>
              <TableCell>
                {satoshisToBitcoins(this.outputAmountSats()).toString()} BTC
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Change Output Address:</TableCell>
              <TableCell>
                <code>{this.changeOutputAddress()}</code>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Change Output Amount:</TableCell>
              <TableCell>
                {satoshisToBitcoins(this.changeOutputAmountSats()).toString()}{" "}
                BTC
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Fees:</TableCell>
              <TableCell>
                {satoshisToBitcoins(this.feeSats()).toString()} BTC
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    );
  }

  inputsTotalSats() {
    return this.params.inputs.reduce((total, input) => {
      return total + input.amountSats.toNumber();
    }, 0);
  }

  outputAddress() {
    return this.params.outputs[0].address;
  }

  outputAmountSats() {
    return this.params.outputs[0].amountSats.toNumber();
  }

  changeOutputAddress() {
    return this.params.outputs[1].address;
  }

  changeOutputAmountSats() {
    return this.params.outputs[1].amountSats.toNumber();
  }

  feeSats() {
    return (
      this.inputsTotalSats() -
      this.outputAmountSats() -
      this.changeOutputAmountSats()
    );
  }

  unsignedTransaction() {
    let unsignedTx;
    try {
      const unsignedTransactionPSBT = unsignedMultisigPSBT(
        this.params.network,
        this.params.inputs,
        this.params.outputs
      );
      unsignedTx = unsignedTransactionObjectFromPSBT(unsignedTransactionPSBT);
    } catch (e) {
      // probably has an input that isn't braid aware.
      unsignedTx = unsignedMultisigTransaction(
        this.params.network,
        this.params.inputs,
        this.params.outputs
      ); // bitcoinjs-lib will throw a Deprecation warning for using TransactionBuilder
    }
    return unsignedTx;
  }

  interaction() {
    return SignMultisigTransaction({
      keystore: this.params.keystore,
      network: this.params.network,
      inputs: this.params.inputs,
      outputs: this.params.outputs,
      bip32Paths: this.params.bip32Paths,
      walletConfig: braidDetailsToWalletConfig(this.params.braidDetails),
      policyHmac: this.params.policyHmac,
      psbt: this.params.psbt,
    });
  }

  expected() {
    if (this.params.keystore === COLDCARD) {
      return this.params.byteCeilingSignature;
    }
    return this.params.signature;
  }
}

export function signingTests(keystore) {
  const transactions = [];
  switch (keystore) {
    case HERMIT:
      TEST_FIXTURES.transactions.forEach((fixture) => {
        if (!fixture.segwit) {
          transactions.push(
            new SignMultisigTransactionTest({
              ...fixture,
              ...{ keystore },
            })
          );
        }
      });
      return transactions;
    case LEDGER:
      return TEST_FIXTURES.transactions
        .filter((fixture) => fixture.policyHmac && fixture.braidDetails)
        .map(
          (fixture) =>
            new SignMultisigTransactionTest({
              ...fixture,
              ...{ keystore },
            })
        );
    default:
      return TEST_FIXTURES.transactions.map(
        (fixture) =>
          new SignMultisigTransactionTest({
            ...fixture,
            ...{ keystore },
          })
      );
  }
}

export default signingTests;
