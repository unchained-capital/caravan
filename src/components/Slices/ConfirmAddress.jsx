import React, { useReducer, useState } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Box,
  Typography,
  Button,
  FormControl,
  Table,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  ThumbUp as SuccessIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import {
  multisigAddressType,
  multisigRequiredSigners,
  multisigTotalSigners,
} from "unchained-bitcoin";
import {
  TREZOR,
  LEDGER,
  COLDCARD,
  HERMIT,
  ACTIVE,
  PENDING,
  ConfirmMultisigAddress,
} from "unchained-wallets";

import { useSelector } from "react-redux";
import ExtendedPublicKeySelector from "../Wallet/ExtendedPublicKeySelector";
import InteractionMessages from "../InteractionMessages";

import { slicePropTypes } from "../../proptypes";
import { getWalletConfig } from "../../selectors/wallet";

const TEXT = "text";

const initialInteractionState = {
  keySelected: false,
  deviceType: "unknown",
  xfp: "",
  bip32Path: "",
  ledgerPolicyHmac: "",
  hasInteraction: false,
  interactionState: PENDING,
  interactionError: "",
  interactionMessage: "",
};

const interactionReducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return {
        ...state,
        interactionError: "",
        interactionMessage: "",
        interactionState: PENDING,
      };
    case "SET_KEY_SELECTED":
      return { ...state, keySelected: true, ...action.value };
    case "SET_KEY_UNSELECTED":
      return { ...state, keySelected: false };
    case "SET_DEVICE_TYPE":
      return { ...state, deviceType: action.value };
    case "SET_BIP32_PATH":
      return { ...state, bip32Path: action.value };
    case "SET_ACTIVE":
      return { ...state, interactionState: ACTIVE };
    case "HAS_INTERACTION":
      return { ...state, hasInteraction: action.value };
    case "SET_MESSAGE":
      return {
        ...state,
        interactionMessage: action.value,
        interactionError: "",
      };
    case "SET_ERROR":
      return {
        ...state,
        interactionError: action.value,
        interactionMessage: "",
      };
    default:
      return state;
  }
};

const ConfirmAddress = ({ slice, network }) => {
  const walletConfig = useSelector(getWalletConfig);
  const [state, dispatch] = useReducer(
    interactionReducer,
    initialInteractionState
  );
  const [interaction, setInteraction] = useState(null);

  const addressType = multisigAddressType(slice.multisig);
  const requiredSigners = multisigRequiredSigners(slice.multisig);
  const totalSigners = multisigTotalSigners(slice.multisig);

  // Sets device interaction for component based on xpub selected
  function handleKeySelected(_event, extendedPublicKeyImporter) {
    const { multisig, bip32Path } = slice;
    if (extendedPublicKeyImporter) {
      const ledgerPolicyHmac =
        walletConfig.ledgerPolicyHmacs.find(
          (policy) => policy.xfp === extendedPublicKeyImporter.rootXfp
        )?.policyHmac || "";
      dispatch({
        type: "SET_KEY_SELECTED",
        value: {
          xfp: extendedPublicKeyImporter.rootXfp,
          ledgerPolicyHmac,
        },
      });
      dispatch({
        type: "SET_DEVICE_TYPE",
        value: extendedPublicKeyImporter.method,
      });
      const fullBip32Path = `${
        extendedPublicKeyImporter.bip32Path
      }${bip32Path.slice(1)}`;
      if (extendedPublicKeyImporter.bip32Path !== "Unknown") {
        dispatch({
          type: "SET_BIP32_PATH",
          value: fullBip32Path,
        });
      } else {
        dispatch({
          type: "SET_BIP32_PATH",
          value: "",
        });
      }
      // FIXME - hardcoded to just show up for trezor
      if (
        extendedPublicKeyImporter.method === TREZOR ||
        extendedPublicKeyImporter.method === LEDGER
      ) {
        setInteraction(
          ConfirmMultisigAddress({
            keystore: extendedPublicKeyImporter.method,
            network,
            bip32Path: fullBip32Path,
            multisig,
            walletConfig,
            policyHmac: ledgerPolicyHmac,
          })
        );
        dispatch({ type: "HAS_INTERACTION", value: true });
        dispatch({ type: "RESET" });
      } else {
        setInteraction(null);
        dispatch({ type: "HAS_INTERACTION", value: false });
        dispatch({ type: "RESET" });
      }
    } else {
      setInteraction(null);
      dispatch({ type: "HAS_INTERACTION", value: false });
      dispatch({ type: "RESET" });
      dispatch({ type: "SET_KEY_UNSELECTED" });
    }
  }

  // Sets device interaction for component based on xpub selected
  function handleMethodChange(event) {
    if (event.target.value !== "") {
      dispatch({
        type: "SET_DEVICE_TYPE",
        value: event.target.value,
      });
      const { multisig } = slice;
      setInteraction(
        ConfirmMultisigAddress({
          keystore: event.target.value,
          network,
          bip32Path: state.bip32Path,
          multisig,
          walletConfig,
          policyHmac: state.ledgerPolicyHmac,
        })
      );
      dispatch({ type: "HAS_INTERACTION", value: true });
      dispatch({ type: "RESET" });
    }
  }

  // run interaction and see if address confirms
  async function confirmOnDevice() {
    dispatch({ type: "SET_ACTIVE" });
    const { multisig } = slice;

    try {
      let confirmed = await interaction.run();
      if (typeof confirmed === "string" && state.deviceType === LEDGER) {
        confirmed = {
          address: confirmed,
          serializedPath: interaction.bip32Path,
        };
      }
      if (
        confirmed.address === multisig.address &&
        confirmed.serializedPath === interaction.bip32Path
      ) {
        dispatch({ type: "SET_MESSAGE", value: "Success" });
      } else {
        dispatch({ type: "SET_ERROR", value: "An unknown error occured" });
      }
    } catch (error) {
      dispatch({ type: "SET_ERROR", value: error.message });
    }
  }

  return (
    <Grid item md={12}>
      <ExtendedPublicKeySelector number={0} onChange={handleKeySelected} />
      {state.keySelected && (
        <form>
          <FormControl fullWidth>
            <TextField
              label="Select Method"
              id="confirm-importer-select"
              select
              value={state.deviceType === "unknown" ? "" : state.deviceType}
              onChange={handleMethodChange}
              variant="standard"
            >
              <MenuItem value="">{"< Select method >"}</MenuItem>
              <MenuItem value={TREZOR}>Trezor</MenuItem>
              <MenuItem value={LEDGER}>Ledger</MenuItem>
              <MenuItem value={COLDCARD} disabled>
                Coldcard
              </MenuItem>
              <MenuItem value={HERMIT} disabled>
                Hermit
              </MenuItem>
              <MenuItem value={TEXT} disabled>
                Enter as text
              </MenuItem>
            </TextField>
          </FormControl>
        </form>
      )}
      {state.hasInteraction && (
        <>
          <Box>
            <p>
              Confirm the following {network.length ? network : ""}{" "}
              {addressType} {requiredSigners} -of-
              {totalSigners} multisig address on your device:
            </p>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Address:</TableCell>
                  <TableCell>
                    <code>{slice.multisig.address}</code>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>BIP32 Path:</TableCell>
                  <TableCell>
                    <code>{state.bip32Path}</code>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          {state.interactionMessage !== "" && (
            <Box mt={2} align="center">
              <Typography variant="h5" style={{ color: "green" }}>
                <SuccessIcon />
                &nbsp; {state.interactionMessage}
              </Typography>
            </Box>
          )}
          {state.interactionError !== "" && (
            <Box mt={2} align="center" style={{ color: "red" }}>
              <Typography variant="h5">
                <ErrorIcon />
                &nbsp; Confirmation Error
              </Typography>
              <Typography variant="caption">
                {state.interactionError}
              </Typography>
            </Box>
          )}
          {state.interactionMessage === "" && state.interactionError === "" && (
            <InteractionMessages
              messages={interaction.messagesFor({
                state: state.interactionState,
              })}
            />
          )}
          <Button
            variant="contained"
            size="large"
            onClick={confirmOnDevice}
            disabled={state.interactionState === ACTIVE || !state.bip32Path}
          >
            Confirm
          </Button>
          {(state.interactionMessage !== "" ||
            state.interactionError !== "") && (
            <Button size="large" onClick={() => dispatch({ type: "RESET" })}>
              Reset
            </Button>
          )}
        </>
      )}
    </Grid>
  );
};

ConfirmAddress.propTypes = {
  slice: PropTypes.shape(slicePropTypes).isRequired,
  network: PropTypes.string,
};

ConfirmAddress.defaultProps = {
  network: "",
};

export default ConfirmAddress;
