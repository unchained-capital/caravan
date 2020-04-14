import React from "react";
import {
  blockExplorerAddressURL,
  satoshisToBitcoins,
  unsignedMultisigTransaction,
  TEST_FIXTURES,
} from "unchained-bitcoin";
import { SignMultisigTransaction } from "unchained-wallets";
import { Box, Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import { externalLink } from "../utils";

import Test from "./Test";

class SignMultisigTransactionTest extends Test {
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

  feeSats() {
    return this.inputsTotalSats() - this.outputAmountSats();
  }

  unsignedTransaction() {
    return unsignedMultisigTransaction(
      this.params.network,
      this.params.inputs,
      this.params.outputs
    );
  }

  interaction() {
    return SignMultisigTransaction({
      keystore: this.params.keystore,
      network: this.params.network,
      inputs: this.params.inputs,
      outputs: this.params.outputs,
      bip32Paths: this.params.bip32Paths,
    });
  }

  expected() {
    return this.params.signature;
  }
}

export function signingTests(keystore) {
  return TEST_FIXTURES.transactions.map((fixture) => {
    return new SignMultisigTransactionTest({
      ...fixture,
      ...{ keystore },
    });
  });
}

export default signingTests;
