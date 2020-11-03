import React from "react";
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
} from "@material-ui/core";
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

class ClientPicker extends React.Component {
  static validatePassword() {
    return "";
  }

  static validateUsername() {
    return "";
  }

  static validateUrl(host) {
    const validhost = /^http(s)?:\/\/[^\s]+$/.exec(host);
    if (!validhost) return "Must be a valid URL.";
    return "";
  }

  constructor(props) {
    super(props);

    this.state = {
      urlEdited: false,
      connectError: "",
      connectSuccess: false,
    };
  }

  handleTypeChange = (event) => {
    const { setType, network, setUrl } = this.props;
    const { urlEdited } = this.state;

    const type = event.target.value;
    if (type === "private" && !urlEdited) {
      setUrl(`http://localhost:${network === "mainnet" ? 8332 : 18332}`);
    }
    setType(type);
  };

  handleUrlChange = (event) => {
    const { setUrl, setUrlError } = this.props;
    const { urlEdited } = this.state;
    const url = event.target.value;
    const error = ClientPicker.validateUrl(url);
    if (!urlEdited && !error) this.setState({ urlEdited: true });
    setUrl(url);
    setUrlError(error);
  };

  handleUsernameChange = (event) => {
    const { setUsername, setUsernameError } = this.props;
    const username = event.target.value;
    const error = ClientPicker.validateUsername(username);
    setUsername(username);
    setUsernameError(error);
  };

  handlePasswordChange = (event) => {
    const { setPassword, setPasswordError } = this.props;
    const password = event.target.value;
    const error = ClientPicker.validatePassword(password);
    setPassword(password);
    setPasswordError(error);
  };

  testConnection = async () => {
    const { network, client, onSuccess } = this.props;
    this.setState({ connectError: "", connectSuccess: false });
    try {
      await fetchFeeEstimate(network, client);
      if (onSuccess) {
        onSuccess();
      }
      this.setState({ connectSuccess: true });
    } catch (e) {
      this.setState({ connectError: e.message });
    }
  };

  render() {
    const {
      client,
      urlError,
      usernameError,
      passwordError,
      privateNotes,
    } = this.props;
    const { connectSuccess, connectError } = this.state;
    return (
      <Card>
        <Grid container justify="space-between">
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
                  onChange={this.handleTypeChange}
                  checked={client.type === "public"}
                />
                <FormControlLabel
                  id="private"
                  control={<Radio color="primary" />}
                  name="clientType"
                  value="private"
                  label="Private"
                  onChange={this.handleTypeChange}
                  checked={client.type === "private"}
                />
              </RadioGroup>
              {client.type === "public" && (
                <FormHelperText>
                  {"'Public' uses the "}
                  <code>blockstream.info</code>
                  {" API. Switch to private to use a "}
                  <code>bitcoind</code>
                  {" node."}
                </FormHelperText>
              )}
              {client.type === "private" && (
                <PrivateClientSettings
                  handleUrlChange={(event) => this.handleUrlChange(event)}
                  handleUsernameChange={(event) =>
                    this.handleUsernameChange(event)
                  }
                  handlePasswordChange={(event) =>
                    this.handlePasswordChange(event)
                  }
                  client={client}
                  urlError={urlError}
                  usernameError={usernameError}
                  passwordError={passwordError}
                  privateNotes={privateNotes}
                  connectSuccess={connectSuccess}
                  connectError={connectError}
                  testConnection={() => this.testConnection()}
                />
              )}
            </FormControl>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

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
