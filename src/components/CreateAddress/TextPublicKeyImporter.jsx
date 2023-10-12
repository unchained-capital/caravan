import React, { useState } from "react";
import PropTypes from "prop-types";

// Components
import { Button, TextField, Box } from "@mui/material";

const TextPublicKeyImporter = ({ validatePublicKey, onImport }) => {
  const [error, setError] = useState("");
  const [publicKey, setPublicKey] = useState("");

  const importData = () => {
    const newError = validatePublicKey(publicKey);

    if (newError) {
      setError(newError);
    } else {
      onImport({ publicKey });
    }
  };

  const hasError = () => {
    return error !== "";
  };

  const handleChange = (event) => {
    setPublicKey(event.target.value);
    setError(validatePublicKey(publicKey));
  };

  return (
    <Box mt={2}>
      <TextField
        fullWidth
        name="publicKey"
        label="Public Key"
        value={publicKey}
        variant="standard"
        onChange={handleChange}
        error={hasError()}
        helperText={error}
      />

      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={importData}
          disabled={publicKey === "" || hasError()}
        >
          Add Public Key
        </Button>
      </Box>
    </Box>
  );
};

TextPublicKeyImporter.propTypes = {
  validatePublicKey: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default TextPublicKeyImporter;
