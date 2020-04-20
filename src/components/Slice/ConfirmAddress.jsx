import React, { useReducer, useState } from "react";
import PropTypes from "prop-types";
import {
  Grid,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { ThumbUp as SuccessIcon, Error as ErrorIcon } from "@material-ui/icons";
import {
  multisigAddressType,
  multisigRequiredSigners,
  multisigTotalSigners,
  MAINNET,
} from "unchained-bitcoin";
import { ACTIVE, PENDING, ConfirmMultisigAddress } from "unchained-wallets";

import ExtendedPublicKeySelector from "../Wallet/ExtendedPublicKeySelector";
import InteractionMessages from "../InteractionMessages";

import { slicePropTypes } from "../../proptypes";

const initialInteractionState = {
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
  const [state, dispatch] = useReducer(
    interactionReducer,
    initialInteractionState
  );
  const [interaction, setInteraction] = useState(null);

  const addressType = multisigAddressType(slice.multisig);
  const requiredSigners = multisigRequiredSigners(slice.multisig);
  const totalSigners = multisigTotalSigners(slice.multisig);

  function keySelected(_event, extendedPublicKeyImporter) {
    const { multisig, bip32Path } = slice;
    setInteraction(
      ConfirmMultisigAddress({
        keystore: extendedPublicKeyImporter.method,
        network,
        bip32Path: `${extendedPublicKeyImporter.bip32Path}${bip32Path.slice(
          1
        )}`,
        multisig,
      })
    );
    dispatch({ type: "HAS_INTERACTION", value: true });
    dispatch({ type: "RESET" });
  }

  async function confirmOnDevice() {
    dispatch({ type: "SET_ACTIVE" });
    const { multisig } = slice;

    try {
      const confirmed = await interaction.run();
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
      <ExtendedPublicKeySelector number={0} onChange={keySelected} />
      {state.hasInteraction && (
        <>
          <Box>
            <p>
              Confirm the following {network} {addressType} {requiredSigners}
              -of-
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
                    <code>{interaction.bip32Path}</code>
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
            disabled={state.interactionState === ACTIVE}
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
  network: MAINNET,
};
export default ConfirmAddress;
