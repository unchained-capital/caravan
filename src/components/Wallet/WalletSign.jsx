import React from 'react';
import { connect } from 'react-redux';

// Components
import SignatureImporter from '../Spend/SignatureImporter';
import {Box, Button} from "@material-ui/core";

// Actions
import { finalizeOutputs, setRequiredSigners } from '../../actions/transactionActions';


class WalletSign extends React.Component {
  render = () => {
    return (
      <Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={this.handleCancel}>Cancel</Button>

      {this.renderSignatureImporters()}
    </Box>
    )
  }

  renderSignatureImporters = () => {
    const {transaction} = this.props;
    const signatureImporters = [];
    for (var signatureImporterNum = 1; signatureImporterNum <= transaction.requiredSigners; signatureImporterNum++) {
      signatureImporters.push(
        <Box key={signatureImporterNum} mt={2}>
          <SignatureImporter number={signatureImporterNum} />
        </Box>
      );
    }
    return signatureImporters;
  }

  handleCancel = () => {
    const { finalizeOutputs, requiredSigners, setRequiredSigners } = this.props;
    setRequiredSigners(requiredSigners); // this will generate signature importers
    finalizeOutputs(false);

  }
}


function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.spend,
    requiredSigners: state.spend.transaction.requiredSigners,
  };
}

const mapDispatchToProps = { finalizeOutputs, setRequiredSigners };

export default connect(mapStateToProps, mapDispatchToProps)(WalletSign);