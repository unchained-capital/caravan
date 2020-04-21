import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { P2SH, P2SH_P2WSH, P2WSH } from "unchained-bitcoin";

// Components
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from "@material-ui/core";
// Actions
import { setAddressType } from "../actions/settingsActions";

class AddressTypePicker extends React.Component {
  handleTypeChange = (event) => {
    const { setType } = this.props;
    setType(event.target.value);
  };

  render() {
    const { addressType, frozen } = this.props;
    return (
      <Card>
        <CardHeader title="Address Type" />
        <CardContent>
          <FormControl component="fieldset">
            <RadioGroup>
              <FormControlLabel
                id={P2SH}
                control={<Radio color="primary" />}
                name="type"
                value={P2SH}
                label={P2SH}
                onChange={this.handleTypeChange}
                checked={addressType === P2SH}
                disabled={frozen}
              />
              <FormControlLabel
                id={P2SH_P2WSH}
                control={<Radio color="primary" />}
                name="type"
                value={P2SH_P2WSH}
                label={P2SH_P2WSH}
                onChange={this.handleTypeChange}
                checked={addressType === P2SH_P2WSH}
                disabled={frozen}
              />
              <FormControlLabel
                id={P2WSH}
                control={<Radio color="primary" />}
                name="type"
                value={P2WSH}
                label={P2WSH}
                onChange={this.handleTypeChange}
                checked={addressType === P2WSH}
                disabled={frozen}
              />
            </RadioGroup>
            <FormHelperText>
              <small>
                Choose &apos;
                {P2WSH}
                &apos; for best practices, &apos;
                {P2SH}
                &apos; for greatest compatibility.
              </small>
            </FormHelperText>
          </FormControl>
        </CardContent>
      </Card>
    );
  }
}

AddressTypePicker.propTypes = {
  addressType: PropTypes.string.isRequired,
  frozen: PropTypes.bool.isRequired,
  setType: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return state.settings;
}

const mapDispatchToProps = {
  setType: setAddressType,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddressTypePicker);
