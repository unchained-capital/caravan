import React from 'react';
import PropTypes from 'prop-types';
import {
  validateSignaturePublicKey
} from "unchained-bitcoin";

// Components
import { Button, TextField, Box } from '@material-ui/core';

class MessageSignaturePublicKeyImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    publicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetPublicKey: PropTypes.func.isRequired,
  };

  state = {
    error: '',
    publicKey: '',
    address: '',
    message: '',
    signature: '',
  };

  render = () => {
    const { error, publicKey, address, message, signature } = this.state;
    return (
      <Box mt={2}>
        <TextField
          fullWidth
          name="message"
          label="message"
          value={message}
          onChange={this.handleChangeMessage}
          error={this.hasError()}
        />
        <TextField
          fullWidth
          name="address"
          label="address"
          value={address}
          onChange={this.handleChangeAddress}
          error={this.hasError()}
        />
        <TextField
          fullWidth
          name="signature"
          label="signature"
          value={signature}
          onChange={this.handleChangeSignature}
          error={this.hasError()}
          helperText={error}
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={this.import}
            disabled={publicKey === '' || this.hasError()}
          >
            Add Public Key
          </Button>
        </Box>
      </Box>
    );
  }

  import = () => {
    const {validateAndSetPublicKey} = this.props;
    const {publicKey} = this.state;
    validateAndSetPublicKey(publicKey, this.setError);
  }

  hasError = () => {
    return this.state.error !== '';
  }

  setError = (value) => {
    this.setState({error: value});
  }

  handleChangeAddress = (event) => {
    console.log('handleChangeAddress')
    const address = event.target.value;
    this.setState({address})
  	this.validateSignature({address});
  }

  handleChangeMessage = (event) => {
    console.log('handleChangeMessage')
    const message = event.target.value;
 	this.setState({message})
    this.validateSignature({message});
  }

  handleChangeSignature = (event) => {
    console.log('handleChangeSignature')
  	const signature = event.target.value;
 	this.setState({signature})

  	this.validateSignature({signature});
  }

  validateSignature = (newstate) => {
  	const {message, address, signature} = {
  		...this.state,
  		...newstate,
  	}

	const network='testnet';
 	if(message !== '' && address !== '' && signature !== '') {
 		const {publicKey,error} = validateSignaturePublicKey(message, address, signature, network);
 		console.log({publicKey,error})
 		if(error) {
 			this.setState({error})
 		} else {
 			this.setState({error:'',publicKey})
 		}
 	}
  }
}

export default MessageSignaturePublicKeyImporter;
