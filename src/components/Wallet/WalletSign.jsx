import React from 'react';
import { connect } from 'react-redux';

// Components
import SignatureImporter from '../Spend/SignatureImporter';
import {Box} from "@material-ui/core";


class WalletSign extends React.Component {
  render = () => {
    return (
      <Box>
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
}


function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.spend
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSign);