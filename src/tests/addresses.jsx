import React from "react";

import { blockExplorerAddressURL, TEST_FIXTURES } from "unchained-bitcoin";
import {
  ConfirmMultisigAddress,
  LEDGER,
  braidDetailsToWalletConfig,
} from "unchained-wallets";
import { Box, Table, TableBody, TableRow, TableCell } from "@mui/material";
import { externalLink } from "utils/ExternalLink";

import Test from "./Test";

class ConfirmMultisigAddressTest extends Test {
  name() {
    return `Confirm ${this.params.network} ${this.params.type} multisig address`;
  }

  // eslint-disable-next-line class-methods-use-this
  postprocess(result) {
    return result.address ? result.address : result;
  }

  description() {
    return (
      <Box>
        <p>
          Confirm the following
          {this.params.network} {this.params.type} 2-of-2 multisig address on
          your device:
        </p>

        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Address:</TableCell>
              <TableCell>
                {externalLink(
                  blockExplorerAddressURL(
                    this.params.address,
                    this.params.network
                  ),
                  <code>{this.params.address}</code>
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>BIP32 Path:</TableCell>
              <TableCell>
                <code>{this.params.bip32Path}</code>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    );
  }

  interaction() {
    return ConfirmMultisigAddress({
      keystore: this.params.keystore,
      network: this.params.network,
      bip32Path: this.params.bip32Path,
      multisig: this.params.multisig,
      // only used with ledgers, version 2.1 and above
      policyHmac: this.params.policyHmac,
      ...braidDetailsToWalletConfig(
        JSON.parse(this.params.multisig.braidDetails)
      ),
    });
  }
}

const addressTests = (keystore) =>
  TEST_FIXTURES.multisigs
    // if ledger only return if policyHmac exists
    .filter((fixture) => (keystore === LEDGER ? fixture.policyHmac : true))
    .map((fixture) => {
      return new ConfirmMultisigAddressTest({
        ...fixture,
        ...{ keystore },
        expected: fixture.address,
      });
    });

export default addressTests;
