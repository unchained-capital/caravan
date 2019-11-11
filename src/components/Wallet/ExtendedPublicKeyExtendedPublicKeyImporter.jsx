import React from 'react';
import PropTypes from 'prop-types';
import {
  validateExtendedPublicKey,
  deriveChildExtendedPublicKey,
} from "unchained-bitcoin";

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

const DEFAULT_BIP32_PATH = "m/0";

class ExtendedPublicKeyExtendedPublicKeyImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    extendedPublicKeyImporter: PropTypes.shape({}).isRequired,
    extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
    validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.setBIP32PathToDefault();
  }
  state = {
    error: '',
    extendedPublicKey: '',
    extendedPublicKeyError: '',
    bip32PathError: '',
  };

  render = () => {
    const {extendedPublicKeyImporter} = this.props;
    const {error, extendedPublicKey, extendedPublicKeyError, bip32PathError} = this.state;
    return (
      <div>
        <FormGroup>
          <FormLabel>Extended Public Key</FormLabel>
          <FormControl
            name="extendedPublicKey"
            type="text"
            value={extendedPublicKey}
            onChange={this.handleExtendedPublicKeyChange}
            isInvalid={this.hasExtendedPublicKeyError()}
            isValid={extendedPublicKey !== '' && !this.hasExtendedPublicKeyError()}
          />
          <FormText className="text-danger">{extendedPublicKeyError}</FormText>
        </FormGroup>

        <FormGroup>
          <FormLabel>BIP32 Path (relative to xpub)</FormLabel>
          <Row>
            <Col md={10}>
              <FormControl
                name="bip32Path"
                type="text"
                value={extendedPublicKeyImporter.bip32Path}
                onChange={this.handleBIP32PathChange}
                isInvalid={this.hasBIP32PathError()}
                isValid={!this.hasBIP32PathError()}
              />
              <FormText className="text-danger">{bip32PathError}</FormText>
              <FormText>Use the default value if you don&rsquo;t understand BIP32 paths.</FormText>
            </Col>
            <Col md={2}>
              {! this.bip32PathIsDefault() && <Button type="button" variant="secondary" size="sm" onClick={this.resetBIP32Path}>Default</Button>}
            </Col>
          </Row>
          <Button className="mt-2" type="submit" variant="primary" size="lg" onClick={this.import} disabled={this.hasError()}>Import Extended Public Key</Button>
        </FormGroup>

        <FormText className="text-danger">{error}</FormText>
      </div>
    );
  }

  import = () => {
    const {network, extendedPublicKeyImporter, validateAndSetExtendedPublicKey } = this.props;
    const {extendedPublicKey} = this.state;
    const childExtendedPublicKey = deriveChildExtendedPublicKey(extendedPublicKey, extendedPublicKeyImporter.bip32Path, network);
    validateAndSetExtendedPublicKey(childExtendedPublicKey, (error) => { this.setState({error}); });
  }

  setBIP32PathToDefault = () => {
    const {validateAndSetBIP32Path} = this.props;
    validateAndSetBIP32Path(DEFAULT_BIP32_PATH, () => {}, () => {});
  }

  hasBIP32PathError = () => {
    return this.state.bip32PathError !== '';
  }

  hasExtendedPublicKeyError = () => {
    return this.state.extendedPublicKeyError !== '';
  }

  hasError = () => (this.hasBIP32PathError() || this.hasExtendedPublicKeyError());

  setBIP32PathError = (value) => {
    this.setState({bip32PathError: value});
  }

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError, {mode: "unhardened"});
  };

  bip32PathIsDefault = () => {
    const {extendedPublicKeyImporter} = this.props;
    return extendedPublicKeyImporter.bip32Path === DEFAULT_BIP32_PATH;
  }

  resetBIP32Path = () => {
    this.setBIP32PathToDefault();
    this.setBIP32PathError('');
  }

  handleExtendedPublicKeyChange = (event) => {
    const {network, extendedPublicKeyImporters} = this.props;
    const extendedPublicKey = event.target.value;
    let extendedPublicKeyError = validateExtendedPublicKey(extendedPublicKey, network);
    if (extendedPublicKeyError === '') {
      if (Object.values(extendedPublicKeyImporters).find((extendedPublicKeyImporter) => (extendedPublicKeyImporter.extendedPublicKey === extendedPublicKey))) {
        extendedPublicKeyError = "This extended public key has already been imported.";
      }
    }
    this.setState({extendedPublicKey, extendedPublicKeyError});
  };

}

export default ExtendedPublicKeyExtendedPublicKeyImporter;
