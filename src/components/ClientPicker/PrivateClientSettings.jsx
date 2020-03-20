import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
  Grid,
  TextField,
  Button,
  FormHelperText,
  Box,
} from '@material-ui/core';

import { externalLink } from "../../utils";

const propTypes = {
  client: PropTypes.shape({}).isRequired,
  handleUrlChange: PropTypes.func.isRequired,
  handleUsernameChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  testConnection: PropTypes.func.isRequired, 
  url_error: PropTypes.string,
  username_error: PropTypes.string,
  password_error: PropTypes.string,
  privateNotes: PropTypes.node,
  connectSuccess: PropTypes.bool.isRequired,
  connectError: PropTypes.string.isRequired,
}


const PrivateClientSettings = ({
  handleUrlChange,
  handleUsernameChange,
  handlePasswordChange,
  client, 
  url_error, 
  username_error, 
  password_error,
  privateNotes,
  connectSuccess,
  connectError,
  testConnection
}) => (
  <div>
    <p>A <code>bitcoind</code>-compatible client is required to query UTXO data, estimate fees, and broadcast transactions.</p>
    <p>
      <small>
        {'Due to CORS requirements, you must use a proxy around the node. Instructions are available '}
        {externalLink("https://github.com/unchained-capital/caravan#adding-cors-headers", "here")}
        {'.'}
      </small>
    </p>
    <form>

      <Grid container direction="column" spacing={1}>

        <Grid item>
          <TextField
            fullWidth
            label="URL"
            value={client.url}
            onChange={handleUrlChange}
            error={url_error !== ''}
            helperText={url_error}
          />
        </Grid>

        <Grid item>
          <TextField
            id="bitcoind-username"
            fullWidth
            label="Username"
            value={client.username}
            onChange={handleUsernameChange}
            error={username_error}
            helperText={username_error}
          />
        </Grid>

        <Grid item>
          <TextField
            id="bitcoind-password"
            fullWidth
            type="password"
            label="Password"
            value={client.password}
            onChange={handlePasswordChange}
            error={password_error}
            helperText={password_error}
          />
        </Grid>
        <Grid item>
          <Box mt={1}>
            <Button
              variant="contained"
              onClick={testConnection}
            >
              Test Connection
                        </Button>
          </Box>
          <Box mt={2}>
            {connectSuccess && <FormHelperText>Connection Success!</FormHelperText>}
            {connectError !== "" && <FormHelperText error>{connectError}</FormHelperText>}
          </Box>
        </Grid>
      </Grid>
    </form>
    {typeof privateNotes !== 'undefined' && privateNotes}
  </div>
)
PrivateClientSettings.propTypes = propTypes
export default PrivateClientSettings