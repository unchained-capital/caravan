import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchFeeEstimate } from "../../blockchain";

// Components
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
} from '@material-ui/core';

// Actions
import { wrappedActions } from '../../actions/utils';
import {
  SET_CLIENT_TYPE,
  SET_CLIENT_URL,
  SET_CLIENT_USERNAME,
  SET_CLIENT_PASSWORD,
  SET_CLIENT_URL_ERROR,
  SET_CLIENT_USERNAME_ERROR,
  SET_CLIENT_PASSWORD_ERROR,
} from '../../actions/clientActions';

import PrivateClientSettings from './PrivateClientSettings';

const propTypes = {
  client: PropTypes.shape({}).isRequired,
  network: PropTypes.string.isRequired,
  setUrl: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  setPasswordError: PropTypes.func.isRequired,
  setType: PropTypes.func.isRequired,
  setUsername: PropTypes.func.isRequired,
  setUsernameError: PropTypes.func.isRequired,
};

class ClientPicker extends React.Component {
  state = {
    url_edited: false,
    connectError: "",
    connectSuccess: false
  }

  handleTypeChange = (event) => {
    const { setType, network, setUrl } = this.props;
    const type = event.target.value
    if (type === 'private' && !this.state.url_edited) {
      setUrl(`http://localhost:${network === 'mainnet' ? 8332 : 18332}`)
    }
    setType(type);
  }

  handleUrlChange = (event) => {
    const { setUrl, setUrlError } = this.props;
    const url = event.target.value;
    const error = this.validateUrl(url);
    if (!this.state.url_edited && !error) this.setState({ url_edited: true });
    setUrl(url);
    setUrlError(error);
  };

  handleUsernameChange = (event) => {
    const { setUsername, setUsernameError } = this.props;
    const username = event.target.value;
    const error = this.validateUsername(username);
    setUsername(username);
    setUsernameError(error);
  };

  handlePasswordChange = (event) => {
    const { setPassword, setPasswordError } = this.props;
    const password = event.target.value;
    const error = this.validatePassword(password);
    setPassword(password);
    setPasswordError(error);
  };

  validateUrl(host) {
    const validhost = /^http(s)?:\/\/[^\s]+$/.exec(host);
    if (!validhost) return 'Must be a valid URL.'
    return '';
  }

  validatePassword(pass) {
    return '';
  }

  validateUsername(username) {
    return '';
  }

  testConnection = async () => {
    const { network, client } = this.props
    this.setState({ connectError: "", connectSuccess: false });
    try {
      await fetchFeeEstimate(network, client);
      this.setState({ connectSuccess: true });
    } catch (e) {
      this.setState({ connectError: e.message });
    }
  }

  render() {
    const { client, url_error, username_error, password_error, privateNotes } = this.props;
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
                  label={(<strong>Public</strong>)}
                  onChange={this.handleTypeChange}
                  checked={client.type === 'public'}
                />
                <FormControlLabel
                  id="private"
                  control={<Radio color="primary" />}
                  name="clientType"
                  value="private"
                  label="Private"
                  onChange={this.handleTypeChange}
                  checked={client.type === 'private'}
                />
              </RadioGroup>
              {
                client.type === 'public' ? (
                  <FormHelperText>
                    {"'Public' uses the "}
                    <code>blockstream.info</code>
                    {' API. Switch to private to use a '}
                    <code>bitcoind</code>
                    {' node.'}
                  </FormHelperText>
                ) : (
                  <PrivateClientSettings 
                    handleUrlChange={(event) => this.handleUrlChange(event)}
                    handleUsernameChange={(event) => this.handleUsernameChange(event)}
                    handlePasswordChange={(event) => this.handlePasswordChange(event)}
                    client={client}
                    url_error={url_error}
                    username_error={username_error}
                    password_error={password_error}
                    privateNotes={privateNotes}
                    connectSuccess={connectSuccess}
                    connectError={connectError}
                    testConnection={() => this.testConnection()}
                  />
                )
              }
            </FormControl>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

ClientPicker.propTypes = propTypes;

function mapStateToProps(state) {
  return {
    network: state.settings.network,
    client: state.client,
    url_error: state.client.url_error,
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
  }),
)(ClientPicker);
