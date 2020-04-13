import React from "react";
import PropTypes from "prop-types";

// Components
import { TextField, Box } from "@material-ui/core";

class TextExtendedPublicKeyImporter extends React.Component {
  static propTypes = {
    extendedPublicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  };

  state = {
    error: "",
  };

  render = () => {
    const { extendedPublicKeyImporter } = this.props;
    const { error } = this.state;
    return (
      <Box mt={2}>
        <TextField
          fullWidth
          name="publicKey"
          label="Extended Public Key"
          value={extendedPublicKeyImporter.extendedPublicKey}
          onChange={this.handleChange}
          error={this.hasError()}
          helperText={error}
        />
      </Box>
    );
  };

  hasError = () => {
    return this.state.error !== "";
  };

  setError = (value) => {
    this.setState({ error: value });
  };

  handleChange = (event) => {
    const { validateAndSetExtendedPublicKey } = this.props;
    validateAndSetExtendedPublicKey(event.target.value, this.setError);
  };
}

export default TextExtendedPublicKeyImporter;
