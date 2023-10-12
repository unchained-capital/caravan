import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validateBIP32Index } from "unchained-bitcoin";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  FormControl,
  FormHelperText,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
} from "@mui/material";

import { wrappedActions } from "../actions/utils";
import { SET_STARTING_ADDRESS_INDEX } from "../actions/settingsActions";

const StartingAddressIndexPicker = ({
  startingAddressIndex,
  setStartingAddressIndex,
}) => {
  const [customIndex, setCustomIndex] = useState(startingAddressIndex !== 0);
  const [startingAddressIndexField, setStartingAddressIndexField] =
    useState(startingAddressIndex);
  const [startingAddressIndexError, setStartingAddressIndexError] =
    useState("");

  const handleIndexChange = (event) => {
    const index = event.target.value;
    const error = validateBIP32Index(index, { mode: "unhardened" }).replace(
      "BIP32",
      "Starting Address"
    );
    if (!error && index) {
      setStartingAddressIndex(parseInt(index, 10));
    }
    setStartingAddressIndexField(index);
    setStartingAddressIndexError(error);
  };

  const handleCustomIndexChange = (event) => {
    setCustomIndex(event.target.value === "true");
  };

  return (
    <Card>
      <Grid container justifyContent="space-between">
        <CardHeader title="Starting Address Index" />
      </Grid>
      <CardContent>
        <Grid item>
          <FormControl component="fieldset">
            <RadioGroup>
              <FormControlLabel
                id="default"
                control={<Radio color="primary" />}
                name="customIndex"
                value="false"
                label={<strong>Default (0)</strong>}
                onChange={handleCustomIndexChange}
                checked={!customIndex}
              />
              <Tooltip
                title="The starting address index allows you to skip
                    forward in a wallet. Addresses with indices less than the
                    starting address are ignored."
              >
                <FormControlLabel
                  id="custom"
                  control={<Radio color="primary" />}
                  name="customIndex"
                  value="true"
                  label="Custom"
                  onChange={handleCustomIndexChange}
                  checked={customIndex}
                />
              </Tooltip>
              <FormHelperText>
                Use the default value if you do not understand how to use
                starting address index.
              </FormHelperText>
            </RadioGroup>
            {customIndex && (
              <TextField
                fullWidth
                value={startingAddressIndexField}
                variant="standard"
                type="text"
                name="startingAddressIndex"
                onChange={handleIndexChange}
                error={Boolean(startingAddressIndexError)}
                helperText={startingAddressIndexError}
              />
            )}
          </FormControl>
        </Grid>
      </CardContent>
    </Card>
  );
};

StartingAddressIndexPicker.propTypes = {
  startingAddressIndex: PropTypes.number.isRequired,
  setStartingAddressIndex: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    startingAddressIndex: state.settings.startingAddressIndex,
  };
}

export default connect(
  mapStateToProps,
  wrappedActions({
    setStartingAddressIndex: SET_STARTING_ADDRESS_INDEX,
  })
)(StartingAddressIndexPicker);
