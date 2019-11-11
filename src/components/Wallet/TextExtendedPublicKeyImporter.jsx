import React from 'react';
import PropTypes from 'prop-types';

// Components
import {
  FormGroup,
  FormLabel,
  FormControl,
  FormText,
} from 'react-bootstrap';

class TextExtendedPublicKeyImporter extends React.Component {

  static propTypes =  {
    extendedPublicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  };

  state = {
    error: '',
  };

  render = () => {
    const { extendedPublicKeyImporter } = this.props;
    const { error } = this.state;
    return (
      <FormGroup>
        <FormGroup>
          <FormLabel>Extended Public Key</FormLabel>
          <FormControl
            name="publicKey"
            type="text"
            value={extendedPublicKeyImporter.extendedPublicKey}
            onChange={this.handleChange}
            isValid={extendedPublicKeyImporter.extendedPublicKey && !this.hasError()}
          />
          <FormText className="text-danger">{error}</FormText>
        </FormGroup>

      </FormGroup>
    );
  }

  hasError = () => {
    return this.state.error !== '';
  }

  setError = (value) => {
    this.setState({error: value});
  }

  handleChange = (event) => {
    const {validateAndSetExtendedPublicKey} = this.props;
    validateAndSetExtendedPublicKey(event.target.value, this.setError);
  }

}

export default TextExtendedPublicKeyImporter;
