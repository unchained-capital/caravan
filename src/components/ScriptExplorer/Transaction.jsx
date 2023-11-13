import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  signedMultisigTransaction,
  blockExplorerTransactionURL,
} from "unchained-bitcoin";

import {
  Typography,
  Box,
  FormHelperText,
  Button,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { broadcastTransaction } from "../../blockchain";
import Copyable from "../Copyable";
import { externalLink } from "utils/ExternalLink";
import { setTXID } from "../../actions/transactionActions";

class Transaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      broadcasting: false,
      txid: "",
    };
  }

  buildSignedTransaction = () => {
    const { network, inputs, outputs, signatureImporters } = this.props;
    return signedMultisigTransaction(
      network,
      inputs,
      outputs,
      Object.values(signatureImporters).map(
        (signatureImporter) => signatureImporter.signature
      )
    );
  };

  handleBroadcast = async () => {
    const { client, network, setTxid } = this.props;
    const signedTransaction = this.buildSignedTransaction();
    let error = "";
    let txid = "";
    this.setState({ broadcasting: true });
    try {
      txid = await broadcastTransaction(
        signedTransaction.toHex(),
        network,
        client
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      error = `There was an error broadcasting the transaction.: ${e}`;
    } finally {
      this.setState({ txid, error, broadcasting: false });
      setTxid(txid);
    }
  };

  transactionURL = () => {
    const { network } = this.props;
    const { txid } = this.state;
    return blockExplorerTransactionURL(txid, network);
  };

  render() {
    const { error, broadcasting, txid } = this.state;
    const signedTransaction = this.buildSignedTransaction();
    const signedTransactionHex = signedTransaction.toHex();
    return (
      <Card>
        <CardHeader title="Broadcast" />
        <CardContent>
          <form>
            {signedTransaction && (
              <Box mt={4}>
                <Typography variant="h6">Signed Transaction</Typography>
                <Copyable text={signedTransactionHex} code showIcon />
              </Box>
            )}
            {txid === "" ? (
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!signedTransaction || broadcasting}
                  onClick={this.handleBroadcast}
                >
                  Broadcast Transaction
                </Button>
                <FormHelperText error>{error}</FormHelperText>
                <small>
                  <FormHelperText>
                    Warning: Broadcasting this transaction cannot be undone.
                  </FormHelperText>
                </small>
              </Box>
            ) : (
              <Box mt={2}>
                <Typography variant="h5">
                  <Copyable text={txid} code showIcon />
                  &nbsp;
                  {externalLink(this.transactionURL(), <OpenInNew />)}
                </Typography>
                <p>Transaction successfully broadcast.</p>
              </Box>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }
}

Transaction.propTypes = {
  client: PropTypes.shape({}).isRequired,
  network: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setTxid: PropTypes.func.isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    network: state.settings.network,
    client: state.client,
    ...state.client,
    signatureImporters: state.spend.signatureImporters,
    inputs: state.spend.transaction.inputs,
    outputs: state.spend.transaction.outputs,
  };
}

const mapDispatchToProps = {
  setTxid: setTXID,
};

export default connect(mapStateToProps, mapDispatchToProps)(Transaction);
