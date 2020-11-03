import React from "react";
import PropTypes from "prop-types";
import { COLDCARD } from "unchained-wallets";
import { FormGroup, FormHelperText } from "@material-ui/core";
import { MAINNET, P2SH } from "unchained-bitcoin";
import { ColdcardJSONReader } from ".";
import IndirectExtendedPublicKeyImporter from "../Wallet/IndirectExtendedPublicKeyImporter";

class ColdcardExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    const coldcardBIP32Path = this.getColdcardBip32Path();
    this.state = {
      COLDCARD_MULTISIG_BIP32_PATH: coldcardBIP32Path,
    };
  }

  componentDidMount = () => {
    const { extendedPublicKeyImporter, validateAndSetBIP32Path } = this.props;
    const { COLDCARD_MULTISIG_BIP32_PATH } = this.state;
    if (extendedPublicKeyImporter.method === COLDCARD) {
      validateAndSetBIP32Path(
        COLDCARD_MULTISIG_BIP32_PATH,
        () => {},
        () => {},
        {}
      );
    }
  };

  componentDidUpdate(prevProps) {
    const { validateAndSetBIP32Path, network, addressType } = this.props;
    const coldcardBIP32Path = this.getColdcardBip32Path();

    // Any updates to the network/addressType we should set the BIP32Path
    if (
      prevProps.network !== network ||
      prevProps.addressType !== addressType
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ COLDCARD_MULTISIG_BIP32_PATH: coldcardBIP32Path });
      validateAndSetBIP32Path(
        coldcardBIP32Path,
        () => {},
        () => {}
      );
    }
  }

  // Unfortunately not possible to use our Multisig P2SH ROOT on a Coldcard atm
  // because they do not allow us to export m/45'/{0-1}'/0' yet.
  getColdcardBip32Path = () => {
    const { network, addressType, defaultBIP32Path } = this.props;
    const coinPath = network === MAINNET ? "0" : "1";
    const coldcardP2SHPath = `m/45'/${coinPath}/0`;
    return addressType === P2SH ? coldcardP2SHPath : defaultBIP32Path;
  };

  render = () => {
    const {
      extendedPublicKeyImporter,
      validateAndSetExtendedPublicKey,
      validateAndSetBIP32Path,
      validateAndSetRootFingerprint,
      addressType,
      network,
    } = this.props;
    const { extendedPublicKeyError, COLDCARD_MULTISIG_BIP32_PATH } = this.state;
    return (
      <FormGroup>
        <IndirectExtendedPublicKeyImporter
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetExtendedPublicKey={validateAndSetExtendedPublicKey}
          validateAndSetBIP32Path={validateAndSetBIP32Path}
          validateAndSetRootFingerprint={validateAndSetRootFingerprint}
          addressType={addressType}
          network={network}
          resetBIP32Path={this.resetColdcardBIP32Path}
          defaultBIP32Path={COLDCARD_MULTISIG_BIP32_PATH}
          Reader={ColdcardJSONReader}
        />
        <FormHelperText error>{extendedPublicKeyError}</FormHelperText>
      </FormGroup>
    );
  };

  resetColdcardBIP32Path = () => {
    const { validateAndSetBIP32Path } = this.props;
    const { COLDCARD_MULTISIG_BIP32_PATH } = this.state;
    validateAndSetBIP32Path(
      COLDCARD_MULTISIG_BIP32_PATH,
      () => {},
      () => {}
    );
  };
}

ColdcardExtendedPublicKeyImporter.propTypes = {
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
    bip32Path: PropTypes.string,
  }).isRequired,
  network: PropTypes.string.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
  addressType: PropTypes.string.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
};

export default ColdcardExtendedPublicKeyImporter;
