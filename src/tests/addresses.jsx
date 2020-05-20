import React from "react";

import { blockExplorerAddressURL, TEST_FIXTURES } from "unchained-bitcoin";
import { ConfirmMultisigAddress } from "unchained-wallets";
import { Box, Table, TableBody, TableRow, TableCell } from "@material-ui/core";
import { externalLink } from "../utils";

import Test from "./Test";

class ConfirmMultisigAddressTest extends Test {
  // eslint-disable-next-line class-methods-use-this
  matches() {
    return true;
  }

  name() {
    return `Confirm ${this.params.network} ${this.params.type} multisig address`;
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
    });
  }
}

const addressTests = (keystore) =>
  TEST_FIXTURES.multisigs.map((fixture) => {
    return new ConfirmMultisigAddressTest({
      ...fixture,
      ...{ keystore },
    });
  });

export default addressTests;
