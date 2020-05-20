import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Actions

// Components
import {
  Typography,
  Grid,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Box,
} from "@material-ui/core";
import { AddCircle, RemoveCircle } from "@material-ui/icons";
import {
  setTotalSigners as setTotalSignersAction,
  setRequiredSigners as setRequiredSignersAction,
} from "../actions/settingsActions";
import "./styles.css";

const MAX_TOTAL_SIGNERS = 7;

class QuorumPicker extends React.Component {
  renderIncrementRequiredSigners = () => {
    const { requiredSigners, totalSigners, frozen } = this.props;
    const disabled = requiredSigners === totalSigners || frozen;
    return (
      <IconButton
        color="primary"
        onClick={this.handleIncrementRequiredSigners}
        disabled={disabled}
      >
        <AddCircle />
      </IconButton>
    );
  };

  renderDecrementRequiredSigners = () => {
    const { requiredSigners, frozen } = this.props;
    const disabled = requiredSigners === 1 || frozen;
    return (
      <IconButton
        color="secondary"
        onClick={this.handleDecrementRequiredSigners}
        disabled={disabled}
      >
        <RemoveCircle />
      </IconButton>
    );
  };

  renderIncrementTotalSigners = () => {
    const { totalSigners, frozen } = this.props;
    const disabled = totalSigners === MAX_TOTAL_SIGNERS || frozen;
    return (
      <IconButton
        color="primary"
        onClick={this.handleIncrementTotalSigners}
        disabled={disabled}
      >
        <AddCircle />
      </IconButton>
    );
  };

  renderDecrementTotalSigners = () => {
    const { requiredSigners, totalSigners, frozen } = this.props;
    const disabled =
      totalSigners === requiredSigners || totalSigners === 2 || frozen;
    return (
      <IconButton
        color="secondary"
        onClick={this.handleDecrementTotalSigners}
        disabled={disabled}
      >
        <RemoveCircle />
      </IconButton>
    );
  };

  handleIncrementRequiredSigners = (event) => {
    const { requiredSigners, setRequiredSigners } = this.props;
    setRequiredSigners(requiredSigners + 1);
    event.preventDefault();
  };

  handleDecrementRequiredSigners = (event) => {
    const { requiredSigners, setRequiredSigners } = this.props;
    setRequiredSigners(requiredSigners - 1);
    event.preventDefault();
  };

  handleIncrementTotalSigners = (event) => {
    const { totalSigners, setTotalSigners } = this.props;
    setTotalSigners(totalSigners + 1);
    event.preventDefault();
  };

  handleDecrementTotalSigners = (event) => {
    const { totalSigners, setTotalSigners } = this.props;
    setTotalSigners(totalSigners - 1);
    event.preventDefault();
  };

  render() {
    const { requiredSigners, totalSigners } = this.props;

    return (
      <Card>
        <CardHeader title="Quorum" />
        <CardContent>
          <Box>
            <Grid container justify="center">
              <Grid container item xs={2} direction="column">
                &nbsp;
              </Grid>

              <Grid
                container
                item
                xs={3}
                direction="column"
                alignItems="center"
              >
                <Grid item>{this.renderIncrementRequiredSigners()}</Grid>

                <Grid item>
                  <Typography variant="h2">{requiredSigners}</Typography>
                </Grid>

                <Grid item>
                  <small>
                    <p>Required</p>
                  </small>
                </Grid>

                <Grid item>{this.renderDecrementRequiredSigners()}</Grid>
              </Grid>

              <Grid
                container
                item
                xs={2}
                direction="column"
                alignItems="center"
                justify="center"
              >
                <Grid item>
                  <Typography variant="h6">of</Typography>
                </Grid>
              </Grid>

              <Grid
                item
                container
                xs={3}
                direction="column"
                alignItems="center"
              >
                <Grid item>{this.renderIncrementTotalSigners()}</Grid>

                <Grid item>
                  <Typography variant="h2">{totalSigners}</Typography>
                </Grid>

                <Grid item>
                  <small>
                    <p>Total</p>
                  </small>
                </Grid>

                <Grid item>{this.renderDecrementTotalSigners()}</Grid>
              </Grid>
              <Grid container item xs={2} direction="column">
                &nbsp;
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  }
}

QuorumPicker.propTypes = {
  totalSigners: PropTypes.number.isRequired,
  requiredSigners: PropTypes.number.isRequired,
  frozen: PropTypes.bool.isRequired,
  setTotalSigners: PropTypes.func.isRequired,
  setRequiredSigners: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return state.settings;
}

const mapDispatchToProps = {
  setTotalSigners: setTotalSignersAction,
  setRequiredSigners: setRequiredSignersAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(QuorumPicker);
