import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { TESTNET, MAINNET } from "unchained-bitcoin";

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
import { setNetwork } from "../actions/settingsActions";

class NetworkPicker extends React.Component {
  static propTypes = {
    network: PropTypes.string.isRequired,
    frozen: PropTypes.bool.isRequired,
    setNetwork: PropTypes.func.isRequired,
  };

  handleNetworkChange = (event) => {
    const { setNetwork } = this.props;
    setNetwork(event.target.value);
  };

  render() {
    const { network, frozen } = this.props;
    return (
      <Card>
        <CardHeader title="Network" />
        <CardContent>
          <FormControl component="fieldset">
            <RadioGroup>
              <FormControlLabel
                id="mainnet"
                control={<Radio color="primary" />}
                name="network"
                value="mainnet"
                label={<strong>Mainnet</strong>}
                onChange={this.handleNetworkChange}
                checked={network === MAINNET}
                disabled={frozen}
              />
              <FormControlLabel
                id="testnet"
                control={<Radio color="primary" />}
                name="network"
                value="testnet"
                label="Testnet"
                onChange={this.handleNetworkChange}
                checked={network === TESTNET}
                disabled={frozen}
              />
            </RadioGroup>
            <FormHelperText>
              <small>
                Choose 'Mainnet' if you don't understand the difference.
              </small>
            </FormHelperText>
          </FormControl>
        </CardContent>
      </Card>
    );
  }
}

function mapStateToProps(state) {
  return {
    network: state.settings.network,
    frozen: state.settings.frozen,
  };
}

const mapDispatchToProps = {
  setNetwork,
};

export default connect(mapStateToProps, mapDispatchToProps)(NetworkPicker);
