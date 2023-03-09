import React from "react";
import PropTypes from "prop-types";

// Components
import { Button, TextField, Box } from "@mui/material";

class TextPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: "",
      publicKey: "",
    };
  }

  render = () => {
    const { error, publicKey } = this.state;
    return (
      <Box mt={2}>
        <TextField
          fullWidth
          name="publicKey"
          label="Public Key"
          value={publicKey}
          onChange={this.handleChange}
          error={this.hasError()}
          helperText={error}
        />

        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={this.import}
            disabled={publicKey === "" || this.hasError()}
          >
            Add Public Key
          </Button>
        </Box>
      </Box>
    );
  };

  import = () => {
    const { validatePublicKey, onImport } = this.props;
    const { publicKey } = this.state;
    const error = validatePublicKey(publicKey);

    if (error) {
      this.setError(error);
    } else {
      onImport({ publicKey });
    }
  };

  hasError = () => {
    const { error } = this.state;
    return error !== "";
  };

  setError = (value) => {
    this.setState({ error: value });
  };

  handleChange = (event) => {
    const publicKey = event.target.value;
    const { validatePublicKey } = this.props;
    const error = validatePublicKey(publicKey);
    this.setState({ publicKey, error });
  };
}

TextPublicKeyImporter.propTypes = {
  validatePublicKey: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default TextPublicKeyImporter;
