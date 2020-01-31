import React from 'react';
import PropTypes from 'prop-types';

import {
  multisigRequiredSigners,
  multisigPublicKeys,
  satoshisToBitcoins,
} from 'unchained-bitcoin';
import {
  PENDING,
  UNSUPPORTED,
  ACTIVE,
  ERROR,
  ExportPublicKey,
  SignMultisigTransaction,
} from 'unchained-wallets';

// Components
import {
  Button, TextField, FormHelperText,
  Box, Grid,
  Table, TableHead, TableBody,
  TableRow, TableCell,
} from '@material-ui/core';
import {Error} from "@material-ui/icons";
import InteractionMessages from '../InteractionMessages';

class HardwareWalletSignatureImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    inputsTotalSats: PropTypes.object.isRequired,
    inputs: PropTypes.array.isRequired,
    outputs: PropTypes.array.isRequired,
    fee: PropTypes.string.isRequired,
    signatureImporter: PropTypes.shape({}).isRequired,
    signatureImporters: PropTypes.shape({}).isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
    validateAndSetSignature: PropTypes.func.isRequired,
    resetBIP32Path: PropTypes.func.isRequired,
    defaultBIP32Path: PropTypes.string.isRequired,
    enableChangeMethod: PropTypes.func.isRequired,
    disableChangeMethod: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      verified: false,
      verifyError: '',
      signatureError: '',
      bip32PathError: '',
      status: (this.interaction(true).isSupported() ? PENDING : UNSUPPORTED),
    };
  }

  componentDidMount = () => {
    const {isWallet} = this.props;
    if (isWallet) this.setState({verified: true});
    this.resetBIP32Path();
  }

  interaction = (inConstructor) => {
    const verified = (inConstructor ? false : this.state.verified);
    const {signatureImporter, network, inputs, outputs} = this.props;
    const keystore = signatureImporter.method;
    if (verified) {
      const bip32Paths = inputs.map((input) => {
        if (typeof input.bip32Path === 'undefined') return signatureImporter.bip32Path; // pubkey path
        return `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}` // xpub/pubkey slice away the m, keep /
      });
      return SignMultisigTransaction({network, keystore, inputs, outputs, bip32Paths});
    } else {
      let bip32Path, bip32Paths;
      bip32Path = signatureImporter.bip32Path; // pubkey path
      if (typeof inputs[0].bip32Path !== 'undefined') {
        bip32Paths = inputs.map(input => `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}`); // xpub/pubkey slice away the m, keep /
      }
      return ExportPublicKey({network, keystore, bip32Path, bip32Paths});
    }
  }

  render = () => {
    const {signatureImporter} = this.props;
    const {verified, status} = this.state;
    const interaction = this.interaction();
    if (status === UNSUPPORTED) {
      return <FormHelperText error>{interaction.messageTextFor({state: status})}</FormHelperText>;
    }
    return (
      <Box mt={2}>
        <Grid container>
          <Grid item md={10}>
            <TextField
              fullWidth
              name="bip32Path"
              label="BIP32 Path"
              type="text"
              value={signatureImporter.bip32Path}
              onChange={this.handleBIP32PathChange}
              disabled={status !== PENDING || verified}
              error={this.hasBIP32PathError()}
              helperText={this.bip32PathError()}
            />

          </Grid>
          <Grid item md={2}>
            {!this.bip32PathIsDefault() &&
             <Button type="button" variant="contained" size="small" onClick={this.resetBIP32Path} disabled={verified || status !== PENDING}>Default</Button>}
          </Grid>
        </Grid>
        <FormHelperText>Use the default value if you don&rsquo;t understand BIP32 paths.</FormHelperText>
        <Box mt={2}>
          {this.renderAction()}
        </Box>
        {this.renderDeviceConfirmInfo()}
        <InteractionMessages messages={interaction.messagesFor({state: status})} excludeCodes={["bip32"]}/>
      </Box>
    );
  }

  renderDeviceConfirmInfo = () => {
    const {fee, inputsTotalSats} = this.props;
    const {verified, status} = this.state;

    if (verified && status === ACTIVE) {
      return (
        <Box>
          <p>Your device will ask you to verify the following information:</p>
          <Table>
            <TableHead>
              <TableRow hover>
                 <TableCell></TableCell>
                <TableCell>Amount (BTC)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderTargets()}
              <TableRow hover>
                <TableCell>Fee</TableCell>
                <TableCell>{fee}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Total</TableCell>
                <TableCell>{satoshisToBitcoins(inputsTotalSats).toString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      );
    } else return '';
  }

  renderTargets = () => {
    const { outputs } = this.props;
    return outputs.map((output, i) => {
      return (
      <TableRow hover key={i}>
        <TableCell>Address <code>{output.address}</code></TableCell>
        <TableCell>{output.amount}</TableCell>
      </TableRow>
      );
    });
  }

  renderAction = () => {
    const {verified, verifyError, signatureError, status} = this.state;
    if (verified) {
      return (
        <Grid container alignItems="center">
          <Grid item md={3}>
            <Button variant="contained" size="large" color="primary" onClick={this.sign} disabled={status !== PENDING}>Sign</Button>
          </Grid>
          <Grid item md={9}>
            <FormHelperText error>{signatureError}</FormHelperText>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid container alignItems="center">
          <Grid item md={3}>
            <Button variant="contained" size="large" onClick={this.verify} color="primary" disabled={status !== PENDING || this.hasBIP32PathError()}>Verify</Button>
          </Grid>
          <Grid item md={9}>
            <FormHelperText error>{verifyError}</FormHelperText>
          </Grid>
        </Grid>
      );
    }
  }

  //
  // BIP32 Path
  //

  hasBIP32PathError = () => {
    const {bip32PathError, status} = this.state;
    return (bip32PathError !== '' || this.interaction().hasMessagesFor({state: status, level: ERROR, code: "bip32"}));
  }

  bip32PathError = () => {
    const {bip32PathError, status} = this.state;
    if (bip32PathError !== '') { return bip32PathError; }
    return this.interaction().messageTextFor({state: status, level: ERROR, code: "bip32"});
  }

  setBIP32PathError = (value) => {
    this.setState({bip32PathError: value});
  }

  handleBIP32PathChange = (event) => {
    const {validateAndSetBIP32Path} = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError);
  }

  bip32PathIsDefault = () => {
    const {signatureImporter, defaultBIP32Path} = this.props;
    return signatureImporter.bip32Path === defaultBIP32Path;
  }

  resetBIP32Path = () => {
    const {resetBIP32Path} = this.props;
    this.setBIP32PathError('');
    resetBIP32Path();
  }

  //
  // Verify
  //

  verify = async () => {
    const { disableChangeMethod, enableChangeMethod } = this.props;
    disableChangeMethod();
    this.setState({verifyError: '', status: ACTIVE});

    try {
      const publicKey = await this.interaction().run();
      this.verifyPublicKey(publicKey);
    } catch(e) {
      console.error(e);
      this.setState({verifyError: e.message, status: PENDING});
      enableChangeMethod();
    }
  }

  verifyPublicKey = (publicKey) => {
    const {inputs, signatureImporters, enableChangeMethod} = this.props;

    let verifyError = '';
    const publicKeys = typeof publicKey === 'string' ? [publicKey] : publicKey;

    for (let inputIndex=0; inputIndex < inputs.length; inputIndex++) {
      const input = inputs[inputIndex];
      let publicKeyIndex
      for(let i = 0; i < publicKeys.length; i++) {
        publicKeyIndex = multisigPublicKeys(input.multisig).indexOf(publicKeys[i]);
        if (publicKeyIndex > -1) break;
      }
      if (publicKeyIndex < 0) {
        verifyError = <span><Error />&nbsp; This device does not contain the correct key.  Are you sure the BIP32 path is correct?</span>;
        break;
      }

      for (let signatureImporterNum=1; signatureImporterNum < multisigRequiredSigners(input.multisig); signatureImporterNum++) {
        const otherSignatureImporter = signatureImporters[signatureImporterNum];
        for(let otherPublicKeyIndex=0; otherPublicKeyIndex < otherSignatureImporter.publicKeys.length; otherPublicKeyIndex++){
          const otherPublicKey = otherSignatureImporter.publicKeys[otherPublicKeyIndex];
          if (otherPublicKey === publicKey) {
            verifyError = <span><Error />A signature from this key was already imported.</span>;
            break;
          }
        }
        if (verifyError !== '') { break; }
      }
      if (verifyError !== '') { break; }
    }

    this.setState({
      verified: (verifyError === ''),
      verifyError,
      status: PENDING,
    });
    enableChangeMethod();
  }

  //
  // Sign
  //

  sign = async () => {
    const { disableChangeMethod, validateAndSetSignature, enableChangeMethod } = this.props;
    disableChangeMethod();
    this.setState({signatureError: '', status: ACTIVE});

    try {
      const signature = await this.interaction().run();
      validateAndSetSignature(
        signature,
        (signatureError) => {
          const stateUpdate = {signatureError};
          if (signatureError !== '') stateUpdate.status = PENDING;
          this.setState(stateUpdate);
        });
    } catch(e) {
      console.error(e);
      this.setState({signatureError: e.message, status: PENDING});
    }
    enableChangeMethod();
  }

}

export default HardwareWalletSignatureImporter;
