import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  Box,
  TextField,
  Button,
} from '@material-ui/core';

class TextSignatureImporter extends React.Component {

  static propTypes =  {
    signatureImporter: PropTypes.shape({}).isRequired,
    validateAndSetSignature: PropTypes.func.isRequired,
  };

  state = {
    signatureJSON: '',
    error: '',
  };

  render = () => {
    const { signatureJSON, error } = this.state;
    return (
      <Box mt={2}>
        <TextField
          fullWidth
          multiline
          variant="outlined"
          name="signature"
          label="Signature"
          rows={5}
          value={signatureJSON}
          onChange={this.handleChange}
          error={this.hasError()}
          helperText={error}
        />

        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={this.finalize}
            disabled={signatureJSON === ''}
          >
            Add Signature
          </Button>
        </Box>
      </Box>
    );
  }

  hasError = () => {
    return this.state.error !== '';
  }

  setError = (value) => {
    this.setState({error: value});
  }

  handleChange = (event) => {
    const signatureJSON = event.target.value;
    let error = '';
    try {
      JSON.parse(signatureJSON);
    } catch(parseError) {
      error = "Invalid JSON.";
    }
    this.setState({signatureJSON, error});
  }

  finalize = () => {
    const {validateAndSetSignature} = this.props;
    const {signatureJSON} = this.state;
    validateAndSetSignature(
      JSON.parse(signatureJSON),
      this.setError);
  }

}

export default TextSignatureImporter;
