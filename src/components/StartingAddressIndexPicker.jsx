import React from "react";
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
} from "@material-ui/core";

import { wrappedActions } from "../actions/utils";
import { SET_STARTING_ADDRESS_INDEX } from "../actions/settingsActions";

class StartingAddressIndexPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      customIndex: props.startingAddressIndex !== 0,
      startingAddressIndexField: props.startingAddressIndex,
    };
  }

  handleIndexChange = (event) => {
    const { setStartingAddressIndex } = this.props;
    const index = event.target.value;
    const error = validateBIP32Index(index, { mode: "unhardened" }).replace(
      "BIP32",
      "Starting Address"
    );
    if (!error && index) {
      setStartingAddressIndex(parseInt(index, 10));
    }
    this.setState({
      startingAddressIndexField: index,
      startingAddressIndexError: error,
    });
  };

  handleCustomIndexChange = (event) => {
    const customIndex = event.target.value === "true";
    this.setState({ customIndex });
  };

  render() {
    const {
      customIndex,
      startingAddressIndexField,
      startingAddressIndexError,
    } = this.state;
    return (
      <Card>
        <Grid container justify="space-between">
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
                  onChange={this.handleCustomIndexChange}
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
                    onChange={this.handleCustomIndexChange}
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
                  type="text"
                  name="startingAddressIndex"
                  onChange={this.handleIndexChange}
                  error={Boolean(startingAddressIndexError)}
                  helperText={startingAddressIndexError}
                />
              )}
            </FormControl>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

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
