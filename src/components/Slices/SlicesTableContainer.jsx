import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
} from "@mui/material";
import {
  getSlicesWithBalance,
  getZeroBalanceSlices,
  getSpentSlices,
} from "../../selectors/wallet";
import { slicePropTypes, clientPropTypes } from "../../proptypes";

// Components
import SlicesTable from "./SlicesTable";

class SlicesTableContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filterIncludeSpent: false,
      filterIncludeZeroBalance: false,
      displaySlices: props.slicesWithBalance.length
        ? [...props.slicesWithBalance]
        : [],
    };
  }

  componentDidUpdate(newProps) {
    const { slicesWithBalance } = this.props;
    if (newProps.slicesWithBalance.length !== slicesWithBalance.length) {
      this.setDisplaySlices();
    }
  }

  setDisplaySlices() {
    const { slicesWithBalance, zeroBalanceSlices, spentSlices } = this.props;
    const { filterIncludeSpent, filterIncludeZeroBalance } = this.state;
    const newDisplaySlices = [...slicesWithBalance];
    if (filterIncludeSpent) {
      newDisplaySlices.push(...spentSlices);
    }
    if (filterIncludeZeroBalance) {
      newDisplaySlices.push(...zeroBalanceSlices);
    }
    this.setState({ displaySlices: newDisplaySlices });
  }

  filterAddresses = (event, checked) => {
    this.setState({ [event.target.value]: checked }, () =>
      this.setDisplaySlices()
    );
  };

  render() {
    const { filterIncludeSpent, filterIncludeZeroBalance, displaySlices } =
      this.state;
    const { client, network } = this.props;

    return (
      <Card>
        <CardContent>
          <Grid container direction="column">
            <Grid item>
              <SlicesTable
                slices={displaySlices}
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
        </CardContent>
      </Card>
    );
  }
}

SlicesTableContainer.propTypes = {
  slicesWithBalance: PropTypes.arrayOf(PropTypes.shape(slicePropTypes))
    .isRequired,
  zeroBalanceSlices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes))
    .isRequired,
  spentSlices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
  client: PropTypes.shape(clientPropTypes).isRequired,
  network: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    slicesWithBalance: getSlicesWithBalance(state),
    zeroBalanceSlices: getZeroBalanceSlices(state),
    spentSlices: getSpentSlices(state),
    walletMode: state.wallet.common.walletMode,
    client: state.client,
    network: state.settings.network,
  };
}

export default connect(mapStateToProps)(SlicesTableContainer);
