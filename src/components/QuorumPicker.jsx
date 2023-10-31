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
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import {
  setTotalSigners as setTotalSignersAction,
  setRequiredSigners as setRequiredSignersAction,
} from "../actions/settingsActions";
import "./styles.css";

const MAX_TOTAL_SIGNERS = 7;

const QuorumPicker = ({
  frozen,
  requiredSigners,
  setRequiredSigners,
  totalSigners,
  setTotalSigners,
}) => {
  const handleIncrementRequiredSigners = (event) => {
    setRequiredSigners(requiredSigners + 1);
    event.preventDefault();
  };

  const handleDecrementRequiredSigners = (event) => {
    setRequiredSigners(requiredSigners - 1);
    event.preventDefault();
  };

  const handleIncrementTotalSigners = (event) => {
    setTotalSigners(totalSigners + 1);
    event.preventDefault();
  };

  const handleDecrementTotalSigners = (event) => {
    setTotalSigners(totalSigners - 1);
    event.preventDefault();
  };

  const renderIncrementRequiredSigners = () => {
    const disabled = requiredSigners === totalSigners || frozen;
    return (
      <IconButton
        color="primary"
        onClick={handleIncrementRequiredSigners}
        disabled={disabled}
      >
        <AddCircle />
      </IconButton>
    );
  };

  const renderDecrementRequiredSigners = () => {
    const disabled = requiredSigners === 1 || frozen;
    return (
      <IconButton
        color="secondary"
        onClick={handleDecrementRequiredSigners}
        disabled={disabled}
      >
        <RemoveCircle />
      </IconButton>
    );
  };

  const renderIncrementTotalSigners = () => {
    const disabled = totalSigners === MAX_TOTAL_SIGNERS || frozen;
    return (
      <IconButton
        color="primary"
        onClick={handleIncrementTotalSigners}
        disabled={disabled}
      >
        <AddCircle />
      </IconButton>
    );
  };

  const renderDecrementTotalSigners = () => {
    const disabled =
      totalSigners === requiredSigners || totalSigners === 2 || frozen;
    return (
      <IconButton
        color="secondary"
        onClick={handleDecrementTotalSigners}
        disabled={disabled}
      >
        <RemoveCircle />
      </IconButton>
    );
  };

  return (
    <Card>
      <CardHeader title="Quorum" />
      <CardContent>
        <Box>
          <Grid container justifyContent="center">
            <Grid container item xs={2} direction="column">
              &nbsp;
            </Grid>

            <Grid container item xs={3} direction="column" alignItems="center">
              <Grid item>{renderIncrementRequiredSigners()}</Grid>

              <Grid item>
                <Typography variant="h2">{requiredSigners}</Typography>
              </Grid>

              <Grid item>
                <small>
                  <p>Required</p>
                </small>
              </Grid>

              <Grid item>{renderDecrementRequiredSigners()}</Grid>
            </Grid>

            <Grid
              container
              item
              xs={2}
              direction="column"
              alignItems="center"
              justifyContent="center"
            >
              <Grid item>
                <Typography variant="h6">of</Typography>
              </Grid>
            </Grid>

            <Grid item container xs={3} direction="column" alignItems="center">
              <Grid item>{renderIncrementTotalSigners()}</Grid>

              <Grid item>
                <Typography variant="h2">{totalSigners}</Typography>
              </Grid>

              <Grid item>
                <small>
                  <p>Total</p>
                </small>
              </Grid>

              <Grid item>{renderDecrementTotalSigners()}</Grid>
            </Grid>
            <Grid container item xs={2} direction="column">
              &nbsp;
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

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
