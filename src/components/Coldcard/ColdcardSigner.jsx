import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { COLDCARD, ConfigAdapter } from "unchained-wallets";
import { connect } from "react-redux";
import { ColdcardSigningButtons } from ".";
import { ColdcardPSBTReader } from "./ColdcardFileReader";
import { downloadFile } from "../../utils";
import { getWalletDetailsText } from "../../selectors/wallet";

const ColdcardSigner = ({
  onReceivePSBT,
  setError,
  walletDetailsText,
  walletName,
  interaction,
  setActive,
}) => {
  // This tries to reshape it to a Coldcard Wallet Config via unchained-wallets
  const reshapeConfig = (walletDetails) => {
    const walletConfig = JSON.parse(walletDetails);
    const { startingAddressIndex } = walletConfig;
    // If this is a config that's been rekeyed, note that in the name.
    walletConfig.name =
      startingAddressIndex === 0
        ? walletConfig.name
        : `${walletConfig.name}_${startingAddressIndex.toString()}`;

    // At the moment (2020-Dec), Coldcard has just released a new firmware version
    // which addresses the following problem:  that they inverted the ordering
    // for p2sh-p2wsh as p2wsh-p2sh but we need to support the older firmware.
    walletConfig.addressType = walletConfig.addressType.includes("-")
      ? "P2WSH-P2SH"
      : walletConfig.addressType;

    const interactionAdapter = ConfigAdapter({
      KEYSTORE: COLDCARD,
      jsonConfig: walletConfig,
    });
    const body = interactionAdapter.adapt();
    const filename = `wc-${walletConfig.name}.txt`;
    downloadFile(body, filename);
  };
  const handlePSBTDownloadClick = () => {
    const body = interaction.request().data.toBase64();
    const timestamp = moment().format("HHmm");
    const filename = `${timestamp}-${walletName}.psbt`;
    downloadFile(body, filename);
    setActive();
  };

  const handleWalletConfigDownloadClick = () => {
    reshapeConfig(walletDetailsText);
  };

  return (
    <div>
      <ColdcardSigningButtons
        handlePSBTDownloadClick={handlePSBTDownloadClick}
        handleWalletConfigDownloadClick={handleWalletConfigDownloadClick}
      />
      <ColdcardPSBTReader onReceivePSBT={onReceivePSBT} setError={setError} />
    </div>
  );
};

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
