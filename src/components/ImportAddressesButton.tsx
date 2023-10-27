// eslint-disable react/jsx-no-bind
import React, { useState, useEffect } from "react";

// Components
import {
  FormHelperText,
  Button,
  Box,
  Switch,
  FormControlLabel,
  Tooltip,
  Grid,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import InfoIcon from "@mui/icons-material/Info";
import {
  bitcoindImportMulti,
  bitcoindGetAddressStatus,
  bitcoindParams,
} from "../bitcoind";
import { ClientType } from "./types/client";

const useStyles = makeStyles(() => ({
  tooltip: {
    fontSize: ".8rem",
  },
  container: {
    marginTop: "1rem",
  },
}));

interface ImportAddressesButtonProps {
  addresses?: string[];
  client: ClientType;
  importCallback?: (successes: any[], rescan: boolean) => void;
}

/**
 * @description A button for importing a set of given addresses. Includes a switch
 * to optionally choose to rescan the blockchain for balances.
 */
function ImportAddressesButton({
  addresses = [],
  client,
  importCallback = () => {},
}: ImportAddressesButtonProps) {
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState("");
  const [rescan, setRescanPreference] = useState(false);
  const [addressesError, setAddressesError] = useState("");
  const [enableImport, setEnableImport] = useState(false);

  const classes = useStyles();
  // when addresses prop has changed, we want to check its status
  // Address management currently isn't optimized and so they are added to the store
  // one at a time. This effect is run each time that updates. Eventually,
  // this should be optimized to happen all at once. For now though, once we find
  // a single address that can be imported then enable the import button and
  // we won't run this anymore. This is mostly for wallet view, not script entry
  useEffect(() => {
    const checkAddress = async () => {
      // reset in case we can't import
      setEnableImport(false);
      const address = addresses[addresses.length - 1]; // TODO: loop, or maybe just check one
      if (!address) return;
      try {
        // TODO: remove any after converting bitcoind
        const status: any = await bitcoindGetAddressStatus({
          // TODO: use this to warn if spent
          ...bitcoindParams(client),
          address,
        });
        // if there is a problem querying the address, then enable the button
        // once enabled, we won't run checkAddress effect anymore
        if (!status || typeof status.used === "undefined") {
          setEnableImport(true);
        } else {
          setEnableImport(false);
        }
        setAddressesError("");
      } catch (e) {
        // e.status 401 e.statusText
        // e.status 500 e.data.error.message
        const status = (e.response && e.response.status) || "unknown";
        const errorMessage =
          // eslint-disable-next-line no-nested-ternary
          status === 401
            ? e.response.statusText
            : status === 500
            ? e.response.data.error.message
            : e.message || "An unknown address error occured";

        setAddressesError(errorMessage);
      }
    };

    // check address if the button is disabled OR
    // there's been an update to the address array and there's only one
    // this typically is the case for the script interactions when dealing
    // with a single address
    if (
      client.type === "private" &&
      (!enableImport || addresses.length === 1)
    ) {
      checkAddress();
    }
    // eslint-disable-next-line
  }, [addresses, client]);

  // return "addresses" or "address"
  const pluralOrSingularAddress = (capitalize = false) =>
    `${capitalize ? "A" : "a"}ddress${
      addresses && addresses.length > 1 ? "es" : ""
    }`;

  async function importAddresses() {
    const label = ""; // TODO: do we want to allow to set? or set to "caravan"?

    try {
      // TODO: remove any after converting bitcoind
      const response: any = await bitcoindImportMulti({
        ...bitcoindParams(client),
        ...{ addresses, label, rescan },
      });

      const responseError = response.result.reduce((e: any, c: any) => {
        return (c.error && c.error.message) || e;
      }, "");

      setImportError(responseError);
      setImported(!responseError.length);

      if (importCallback) {
        // provide successfully imported addresses to callback
        const successes = response.result.filter((addr: any) => addr.success);
        await importCallback(successes, rescan);
      }
    } catch (e) {
      setImportError("Unable to import, check your settings and try again");
      setImported(false);
    }
  }

  const rescanTooltip = `To get accurate information from your node, your ${pluralOrSingularAddress()}
will need to be imported to your node. Importing will give you accurate balance information
however to know if an address has been used prior to import, a rescan needs to take place.`;

  return (
    <Grid className={classes.container}>
      <Box component="span" ml={2}>
        <Button
          variant="contained"
          disabled={(!enableImport && !rescan) || !addresses.length}
          onClick={importAddresses}
        >
          Import {pluralOrSingularAddress(true)}
        </Button>
      </Box>
      <Box component="span" ml={2}>
        <FormControlLabel
          control={
            <Switch
              checked={rescan}
              onChange={(e) => setRescanPreference(e.target.checked)}
              color="secondary"
            />
          }
          label="Rescan"
        />
        <Tooltip title={rescanTooltip} classes={{ tooltip: classes.tooltip }}>
          <InfoIcon fontSize="small" color="disabled" />
        </Tooltip>
      </Box>
      <Box>
        {addressesError.length > 0 && (
          <FormHelperText error>{addressesError}</FormHelperText>
        )}
        {importError.length > 0 && (
          <FormHelperText error>{importError}</FormHelperText>
        )}
        {imported && rescan && (
          <FormHelperText>
            {pluralOrSingularAddress(true)} imported, rescan of your node may
            take some time.
          </FormHelperText>
        )}
        {imported && !rescan && (
          <FormHelperText>
            {pluralOrSingularAddress(true)} imported.
          </FormHelperText>
        )}
      </Box>
    </Grid>
  );
}

export default ImportAddressesButton;
