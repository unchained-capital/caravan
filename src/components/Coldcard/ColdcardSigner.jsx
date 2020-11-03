import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { COLDCARD, ConfigAdapter } from "unchained-wallets";
import { connect } from "react-redux";
import { ColdcardSigningButtons } from ".";
import { ColdcardPSBTReader } from "./ColdcardFileReader";
import { downloadFile } from "../../utils";
import { getWalletDetailsText } from "../../selectors/wallet";

class ColdcardSigner extends Component {
  handlePSBTDownloadClick = () => {
    const { walletName, interaction, setActive } = this.props;
    const body = interaction.request().toBase64();
    const timestamp = moment().format("HHmm");
    const filename = `${timestamp}-${walletName}.psbt`;
    downloadFile(body, filename);
    setActive();
  };

  handleWalletConfigDownloadClick = () => {
    const { walletDetailsText } = this.props;
    this.reshapeConfig(walletDetailsText);
  };

  // This tries to reshape it to a Coldcard Wallet Config via unchained-wallets
  reshapeConfig = (walletDetails) => {
    const walletConfig = JSON.parse(walletDetails);
    const { startingAddressIndex } = walletConfig;
    // If this is a config that's been rekeyed, note that in the name.
    walletConfig.name =
      startingAddressIndex === 0
        ? walletConfig.name
        : `${walletConfig.name}_${startingAddressIndex.toString()}`;

    const interaction = ConfigAdapter({
      KEYSTORE: COLDCARD,
      jsonConfig: walletConfig,
    });
    const body = interaction.adapt();
    const filename = `wc-${walletConfig.name}.txt`;
    downloadFile(body, filename);
  };

  render = () => {
    const { onReceivePSBT, setError } = this.props;
    return (
      <div>
        <ColdcardSigningButtons
          handlePSBTDownloadClick={this.handlePSBTDownloadClick}
          handleWalletConfigDownloadClick={this.handleWalletConfigDownloadClick}
        />
        <ColdcardPSBTReader onReceivePSBT={onReceivePSBT} setError={setError} />
      </div>
    );
  };
}

ColdcardSigner.propTypes = {
  walletName: PropTypes.string.isRequired,
  interaction: PropTypes.shape({
    request: PropTypes.func,
  }).isRequired,
  setActive: PropTypes.func.isRequired,
  walletDetailsText: PropTypes.string.isRequired,
  onReceivePSBT: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    walletName: state.wallet.common.walletName,
    walletDetailsText: getWalletDetailsText(state),
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ColdcardSigner);
