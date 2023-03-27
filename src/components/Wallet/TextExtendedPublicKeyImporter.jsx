import React from "react";
import PropTypes from "prop-types";

// Components
import { TextField, Box } from "@mui/material";

class TextExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
    };
  }

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
          variant="standard"
          onChange={this.handleChange}
          error={this.hasError()}
          helperText={error}
        />
      </Box>
    );
  };

  hasError = () => {
    const { error } = this.state;
    return error !== "";
  };

  setError = (value) => {
    this.setState({ error: value });
  };

  handleChange = (event) => {
    const { validateAndSetExtendedPublicKey } = this.props;
    validateAndSetExtendedPublicKey(event.target.value, this.setError);
  };
}
TextExtendedPublicKeyImporter.propTypes = {
  extendedPublicKeyImporter: PropTypes.shape({
    extendedPublicKey: PropTypes.string,
  }).isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
};

export default TextExtendedPublicKeyImporter;
