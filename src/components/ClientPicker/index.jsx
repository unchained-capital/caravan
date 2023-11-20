import React, { useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  FormControl,
  Radio,
  RadioGroup,
  FormHelperText,
} from "@mui/material";
import { fetchFeeEstimate } from "../../blockchain";

// Components

// Actions
import { wrappedActions } from "../../actions/utils";
import {
  SET_CLIENT_TYPE,
  SET_CLIENT_URL,
  SET_CLIENT_USERNAME,
  SET_CLIENT_PASSWORD,
  SET_CLIENT_URL_ERROR,
  SET_CLIENT_USERNAME_ERROR,
  SET_CLIENT_PASSWORD_ERROR,
} from "../../actions/clientActions";

import PrivateClientSettings from "./PrivateClientSettings";

const ClientPicker = ({
  setType,
  network,
  setUrl,
  setUrlError,
  setUsername,
  setUsernameError,
  setPassword,
  setPasswordError,
  client,
  onSuccess,
  urlError,
  usernameError,
  passwordError,
  privateNotes,
}) => {
  const [urlEdited, setUrlEdited] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [connectSuccess, setConnectSuccess] = useState(false);

  const validatePassword = () => {
    return "";
  };

  const validateUsername = () => {
    return "";
  };

  const validateUrl = (host) => {
    const validhost = /^http(s)?:\/\/[^\s]+$/.exec(host);
    if (!validhost) return "Must be a valid URL.";
    return "";
  };

  const handleTypeChange = (event) => {
    const clientType = event.target.value;
    if (clientType === "private" && !urlEdited) {
      setUrl(`http://localhost:${network === "mainnet" ? 8332 : 18332}`);
    }
    setType(clientType);
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    const error = validateUrl(url);
    if (!urlEdited && !error) setUrlEdited(true);
    setUrl(url);
    setUrlError(error);
  };

  const handleUsernameChange = (event) => {
    const username = event.target.value;
    const error = validateUsername(username);
    setUsername(username);
    setUsernameError(error);
  };

  const handlePasswordChange = (event) => {
    const password = event.target.value;
    const error = validatePassword(password);
    setPassword(password);
    setPasswordError(error);
  };

  const testConnection = async () => {
    setConnectError("");
    setConnectSuccess(false);
    try {
      await fetchFeeEstimate(network, client);
      if (onSuccess) {
        onSuccess();
      }
      setConnectSuccess(true);
    } catch (e) {
      setConnectError(e.message);
    }
  };

  return (
    <Card>
      <Grid container justifyContent="space-between">
        <CardHeader title="Bitcoin Client" />
      </Grid>
      <CardContent>
        <Grid item>
          <FormControl component="fieldset">
            <RadioGroup>
              <FormControlLabel
                id="public"
                control={<Radio color="primary" />}
                name="clientType"
                value="public"
                label={<strong>Public</strong>}
                onChange={handleTypeChange}
                checked={client.type === "public"}
              />
              <FormControlLabel
                id="private"
                control={<Radio color="primary" />}
                name="clientType"
                value="private"
                label="Private"
                onChange={handleTypeChange}
                checked={client.type === "private"}
              />
            </RadioGroup>
            {client.type === "public" && (
              <FormHelperText>
                {"'Public' uses the "}
                <code>mempool.space</code>
                {" API. Switch to private to use a "}
                <code>bitcoind</code>
                {" node."}
              </FormHelperText>
            )}
            {client.type === "private" && (
              <PrivateClientSettings
                handleUrlChange={(event) => handleUrlChange(event)}
                handleUsernameChange={(event) => handleUsernameChange(event)}
                handlePasswordChange={(event) => handlePasswordChange(event)}
                client={client}
                urlError={urlError}
                usernameError={usernameError}
                passwordError={passwordError}
                privateNotes={privateNotes}
                connectSuccess={connectSuccess}
                connectError={connectError}
                testConnection={() => testConnection()}
              />
            )}
          </FormControl>
        </Grid>
      </CardContent>
    </Card>
  );
};

ClientPicker.propTypes = {
  client: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
  network: PropTypes.string.isRequired,
  privateNotes: PropTypes.shape({}),
  setUrl: PropTypes.func.isRequired,
  urlError: PropTypes.string,
  onSuccess: PropTypes.func,
  setUrlError: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  passwordError: PropTypes.string,
  setPasswordError: PropTypes.func.isRequired,
  setType: PropTypes.func.isRequired,
  usernameError: PropTypes.string,
  setUsername: PropTypes.func.isRequired,
  setUsernameError: PropTypes.func.isRequired,
};

ClientPicker.defaultProps = {
  urlError: "",
  usernameError: "",
  onSuccess: null,
  passwordError: "",
  privateNotes: React.createElement("span"),
};

function mapStateToProps(state) {
  return {
    network: state.settings.network,
    client: state.client,
    urlError: state.client.urlError,
    url: state.client.url,
  };
}

export default connect(
  mapStateToProps,
  wrappedActions({
    setType: SET_CLIENT_TYPE,
    setUrl: SET_CLIENT_URL,
    setUsername: SET_CLIENT_USERNAME,
    setPassword: SET_CLIENT_PASSWORD,
    setUrlError: SET_CLIENT_URL_ERROR,
    setUsernameError: SET_CLIENT_USERNAME_ERROR,
    setPasswordError: SET_CLIENT_PASSWORD_ERROR,
  })
)(ClientPicker);
