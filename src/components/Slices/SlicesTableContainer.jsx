import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
} from "@material-ui/core";
import { getSlicesWithBalance } from "../../selectors/wallet";
import { slicePropTypes, clientPropTypes } from "../../proptypes";

// Components
import SlicesTable from "./SlicesTable";

class SlicesTableContainer extends React.PureComponent {
  static propTypes = {
    slices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
    client: PropTypes.shape(clientPropTypes).isRequired,
    network: PropTypes.string.isRequired,
    // walletMode: PropTypes.number.isRequired,
    // addNode: PropTypes.func.isRequired,
    // updateNode: PropTypes.func.isRequired,
    // walletMode: PropTypes.number.isRequired,
  };

  state = {
    filterIncludeSpent: false,
    filterIncludeZeroBalance: false,
  };

  filterAddresses = (event, checked) => {
    this.setState({ [event.target.value]: checked });
  };

  render() {
    const { filterIncludeSpent, filterIncludeZeroBalance } = this.state;
    const { slices, client, network } = this.props;
    return (
      <Grid container direction="column">
        <Grid item>
          <SlicesTable
            slices={slices}
            client={client}
            network={network}
            paging
          />
        </Grid>
        <Grid item>
          <FormGroup row>
            <FormLabel component="h2">
              <Box mr={3}>Show Additional</Box>
            </FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterIncludeSpent}
                  value="filterIncludeSpent"
                  onChange={this.filterAddresses}
                />
              }
              label="Spent Addresses"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filterIncludeZeroBalance}
                  value="filterIncludeZeroBalance"
                  onChange={this.filterAddresses}
                />
              }
              label="Zero Balance"
            />
          </FormGroup>
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    slices: getSlicesWithBalance(state),
    walletMode: state.wallet.common.walletMode,
    client: state.client,
    network: state.settings.network,
  };
}

export default connect(mapStateToProps)(SlicesTableContainer);
