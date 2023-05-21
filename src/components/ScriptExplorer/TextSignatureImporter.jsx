import React from "react";
import PropTypes from "prop-types";
import { Box, TextField, Button } from "@mui/material";

class TextSignatureImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureJSON: "",
      error: "",
    };
  }

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
            disabled={signatureJSON === ""}
          >
            Add Signature
          </Button>
        </Box>
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
    const signatureJSON = event.target.value;
    let error = "";
    try {
      JSON.parse(signatureJSON);
    } catch (parseError) {
      error = "Invalid JSON.";
    }
    this.setState({ signatureJSON, error });
  };

  finalize = () => {
    const { validateAndSetSignature } = this.props;
    const { signatureJSON } = this.state;
    try {
      const sig = JSON.parse(signatureJSON);
      validateAndSetSignature(sig, this.setError);
    } catch (e) {
      this.setError(e.message);
    }
  };
}

TextSignatureImporter.propTypes = {
  signatureImporter: PropTypes.shape({}).isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
};

export default TextSignatureImporter;
