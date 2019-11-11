import React from 'react';
import PropTypes from 'prop-types';
import {
  UNSUPPORTED, PENDING, ACTIVE, ERROR,
  HardwareWalletExportExtendedPublicKey,
} from "unchained-wallets";
import {  multisigBIP32Root } from "unchained-bitcoin";

// Components
import {
  Row,
  Col,
  FormGroup,
  FormLabel,
  FormControl,
  FormText,
  Button,
} from 'react-bootstrap';
import WalletFeedback from '../WalletFeedback';

class HardwareWalletExtendedPublicKeyImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    addressType: PropTypes.string.isRequired,
    extendedPublicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
    defaultBIP32Path: PropTypes.string.isRequired,
    resetBIP32Path: PropTypes.func.isRequired,
    enableChangeMethod: PropTypes.func.isRequired,
    disableChangeMethod: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.resetBIP32Path();
  }

  constructor(props) {
    super(props);
    this.state = {
      extendedPublicKeyError: '',
      bip32PathError: '',
      walletState: (this.interaction().isSupported() ? PENDING : UNSUPPORTED),
    };
  }

  interaction = () => {
    const {network, extendedPublicKeyImporter} = this.props;
    return HardwareWalletExportExtendedPublicKey({network, walletType: extendedPublicKeyImporter.method, bip32Path: extendedPublicKeyImporter.bip32Path});
  }

  render = () => {
    const {extendedPublicKeyImporter} = this.props;
    const {walletState, extendedPublicKeyError} = this.state;
    const interaction = this.interaction();
    if (walletState === UNSUPPORTED) {
      return <FormText className="text-danger">{interaction.messageTextFor({walletState})}</FormText>;
    }
    return (
      <FormGroup>
        <FormLabel>BIP32 Path</FormLabel>
        <Row>
          <Col md={10}>
            <FormControl
              name="bip32Path"
              type="text"
              value={extendedPublicKeyImporter.bip32Path}
              onChange={this.handleBIP32PathChange}
              disabled={walletState !== PENDING}
              isInvalid={this.hasBIP32PathError()}
            />
            <FormText className="text-danger">{this.bip32PathError()}</FormText>
            <FormText>Use the default value if you don&rsquo;t understand BIP32 paths.</FormText>
          </Col>
          <Col md={2}>
            {!this.bip32PathIsDefault() && <Button type="button" variant="secondary" size="sm" onClick={this.resetBIP32Path}  disabled={walletState !== PENDING}>Default</Button>}
          </Col>
        </Row>
        <Button className="mt-2" type="submit" variant="primary" size="lg" onClick={this.import} disabled={this.hasBIP32PathError()}>Import Extended Public Key</Button>
        <WalletFeedback messages={interaction.messagesFor({walletState})} excludeCodes={["bip32"]}/>
        <FormText className="text-danger">{extendedPublicKeyError}</FormText>
      </FormGroup>
    );
  }

  import = async () => {
    const {validateAndSetExtendedPublicKey, enableChangeMethod, disableChangeMethod} = this.props;
    disableChangeMethod();
    this.setState({extendedPublicKeyError: '', walletState: ACTIVE});
    try {
      const extendedPublicKey = await this.interaction().run();
      validateAndSetExtendedPublicKey(extendedPublicKey, (error) => {this.setState({extendedPublicKeyError: error, walletState: PENDING});});
    } catch(e) {
      console.error(e);
      this.setState({extendedPublicKeyError: e.message, walletState: PENDING});
    }

    enableChangeMethod();
  }


  hasBIP32PathError = () => {
    const {bip32PathError, walletState} = this.state;
    return (bip32PathError !== '' || this.interaction().hasMessagesFor({walletState, level: ERROR, code: "bip32"}));
  }

  bip32PathError = () => {
    const {bip32PathError, walletState} = this.state;
    if (bip32PathError !== '') { return bip32PathError; }
    return this.interaction().messageTextFor({walletState, level: ERROR, code: "bip32"});
  }

  setBIP32PathError = (value) => {
    this.setState({bip32PathError: value});
  }

  handleBIP32PathChange = (event) => {
    const { network, validateAndSetBIP32Path, extendedPublicKeyImporter } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError);
  };

  bip32PathIsDefault = () => {
    const {extendedPublicKeyImporter, defaultBIP32Path} = this.props;
    return extendedPublicKeyImporter.bip32Path === defaultBIP32Path;
  }

  resetBIP32Path = () => {
    const {resetBIP32Path, network, extendedPublicKeyImporter, addressType} = this.props;
    const bip32Path = multisigBIP32Root(addressType, network);
    this.setBIP32PathError('');
    resetBIP32Path();
  }

}

export default HardwareWalletExtendedPublicKeyImporter;
