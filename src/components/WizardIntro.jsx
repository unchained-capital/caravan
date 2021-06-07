import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Actions

// Components
import { Grid, Card, CardHeader, CardContent, Box } from "@material-ui/core";

const WizardIntro = (props) => {
  const { wizardCurrentStep, prevBtn, nextBtn, renderWalletImporter } = props;
  if (wizardCurrentStep !== 0) {
    return null;
  }
  return (
    <Card className="wizard-card-wrapper">
      <CardHeader title="Create Your Multisig Wallet" />
      <CardContent>
        <Grid item xs={12}>
          {renderWalletImporter()}
          <Box mt={3} id="wallet-wizard-nav-btn-wrapper">
            {prevBtn}
            {nextBtn}
          </Box>
        </Grid>
      </CardContent>
    </Card>
  );
};

WizardIntro.propTypes = {
  renderWalletImporter: PropTypes.func.isRequired,
  nextBtn: PropTypes.shape({ $$typeof: PropTypes.symbol }),
  prevBtn: PropTypes.shape({ $$typeof: PropTypes.symbol }),
  wizardCurrentStep: PropTypes.number.isRequired,
};

WizardIntro.defaultProps = {
  nextBtn: null,
  prevBtn: null,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...{
      wizardCurrentStep: state.wallet.common.wizardCurrentStep,
    },
  };
}

export default connect(mapStateToProps)(WizardIntro);
