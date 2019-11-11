import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {externalLink} from "../utils";

// Components
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  TextField,
  InputAdornment,
  Switch,
} from '@material-ui/core';

// Actions
import { wrappedActions } from '../actions/utils';
import {
  SET_CLIENT_TYPE,
  SET_CLIENT_URL,
  SET_CLIENT_USERNAME,
  SET_CLIENT_PASSWORD,

  SET_CLIENT_URL_ERROR,
  SET_CLIENT_USERNAME_ERROR,
  SET_CLIENT_PASSWORD_ERROR,

  SET_CLIENT_STATUS,
} from '../actions/clientActions';

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
    url_edited: false
  }

  handleTypeChange = (event) => {
    const { setType, network, setUrl } = this.props;
    const type = event.target.checked ? 'private' : 'public';
    if (type === 'private' && !this.state.url_edited) {
      setUrl(`http://localhost:${network === 'mainnet' ? 8332 : 18332}`)
    }
    setType(type);
  }

  handleUrlChange = (event) => {
    const { setUrl, setUrlError } = this.props;
    const url = event.target.value;
    const error = this.validateUrl(url);
    if (!this.state.url_edited && !error) this.setState({url_edited: true});
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

  toggle = () => {
    const { client } = this.props;
    const label = client.type.charAt(0).toUpperCase() + client.type.slice(1);
    return (
      <FormControlLabel
        control={
          <Switch
            color="primary"
            checked={client.type === 'private'}
            onChange={this.handleTypeChange}
            value="private" />
        }
        label={label}
      />
    );
  }

  title = () => (
    <Grid container justify="space-between">
      <Grid item>Consensus</Grid>
      <Grid item>{this.toggle()}</Grid>
    </Grid>
  )

  disabled = () => (false);

  render() {
    const { client, url_error, username_error, password_error } = this.props;
    return (
      <Card>
        <CardHeader title={this.title()}/>
        <CardContent>
          {(client.type === 'public')
           ? (
             <p>
               {"'Public' uses the "}
               <code>blockstream.info</code>
               {' API. Switch to private to use a '}
               <code>bitcoind</code>
               {' node.'}
             </p>
           ) : (
             <div>
               <p>A <code>bitcoind</code>-compatible client is required to query UTXO data, estimate fees, and broadcast transactions.</p>
               <p>
                 <small>
                   {'Due to CORS requirements, you must use a proxy around the node. Instructions are available '}
                   {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                   {externalLink("", "here")}
                   {'.'}
                 </small>
               </p>
               <form>

                 <Grid container direction="column">

                   <Grid item>
                     <TextField
                       fullWidth
                       label="URL"
                       value={client.url}
                       onChange={this.handleUrlChange}
                       disabled={this.disabled()}
                       error={url_error !== ''}
                       helperText={url_error}
                       InputProps={{
                         startAdornment: <InputAdornment position="start"></InputAdornment>,
                       }}
                     />
                   </Grid>

                   <Grid item>


                   </Grid>

                   <Grid item>
                     <TextField
                       fullWidth
                       label="Username"
                       value={client.username}
                       onChange={this.handleUsernameChange}
                       disabled={this.disabled()}
                       error={username_error}
                       helperText={username_error}
                     />
                   </Grid>

                   <Grid item>
                     <TextField
                       fullWidth
                       type="password"
                       label="Password"
                       value={client.password}
                       onChange={this.handlePasswordChange}
                       disabled={this.disabled()}
                       error={password_error}
                       helperText={password_error}
                     />
                   </Grid>
                 </Grid>
               </form>
             </div>
           )}
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

    setStatus: SET_CLIENT_STATUS,
  }),
)(ClientPicker);
