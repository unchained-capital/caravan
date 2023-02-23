import React from "react";

import { TEST_FIXTURES } from "unchained-bitcoin";
import {
  RegisterWalletPolicy,
  braidDetailsToWalletConfig,
} from "unchained-wallets";
import { Box, Table, TableBody, TableRow, TableCell } from "@material-ui/core";

import Test from "./Test";

class RegisterWalletPolicyTest extends Test {
  name() {
    return `Confirm ${this.params.network} ${this.params.type} multisig wallet policy`;
  }

  // eslint-disable-next-line class-methods-use-this
  postprocess(result) {
    return result;
  }

  expected() {
    return this.params.policyHmac;
  }

  description() {
    return (
      <Box>
        <p>
          Confirm the wallet policy: &quot;{this.params.network}{" "}
          {this.params.type} 2-of-2 multisig address&quote;
        </p>

        <Table style={{ tableLayout: "fixed", width: "100%" }}>
          <TableBody>
            <TableRow>
              <TableCell>Name:</TableCell>
              <TableCell colSpan={5}>{this.params.walletConfig.name}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Expected token:</TableCell>
              <TableCell colSpan={5}>
                <code>{this.params.policyHmac}</code>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={6}
                style={{ textAlign: "center", textTransform: "uppercase" }}
              >
                Registering Quorum
              </TableCell>
            </TableRow>
            {this.params.braidDetails.extendedPublicKeys.map((key, index) => (
              <React.Fragment key={key.rootFingerprint}>
                <TableRow>
                  <TableCell colSpan={6} style={{ textAlign: "center" }}>
                    Key {index}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>xpub:</TableCell>
                  <TableCell style={{ wordBreak: "break-word" }} colSpan={5}>
                    <code>{key.base58String}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>xfp:</TableCell>
                  <TableCell style={{ wordBreak: "break-word" }} colSpan={5}>
                    <code>{key.rootFingerprint}</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Path:</TableCell>
                  <TableCell style={{ wordBreak: "break-word" }} colSpan={5}>
                    <code>{key.path}</code>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  }

  interaction() {
    return RegisterWalletPolicy({
      keystore: this.params.keystore,
      // only used with ledgers, version 2.1 and above
      policyHmac: this.params.policyHmac,
      verify: true,
      ...this.params.walletConfig,
    });
  }
}

const registrationTests = (keystore) =>
  TEST_FIXTURES.multisigs
    .filter((fixture) => fixture.policyHmac && fixture.braidDetails)
    .map(
      (fixture) =>
        new RegisterWalletPolicyTest({
          ...fixture,
          ...{ keystore },
          walletConfig: braidDetailsToWalletConfig(fixture.braidDetails),
        })
    );

export default registrationTests;
