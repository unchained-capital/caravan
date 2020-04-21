import React from "react";
import PropTypes from "prop-types";
import { validatePublicKey } from "unchained-bitcoin";

// Components
import { Button, TextField, Box } from "@material-ui/core";

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
    const { validateAndSetPublicKey } = this.props;
    const { publicKey } = this.state;
    validateAndSetPublicKey(publicKey, this.setError);
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
    const error = validatePublicKey(publicKey);
    this.setState({ publicKey, error });
  };
}

TextPublicKeyImporter.propTypes = {
  publicKeyImporter: PropTypes.shape({}).isRequired,
  validateAndSetPublicKey: PropTypes.func.isRequired,
};

export default TextPublicKeyImporter;
