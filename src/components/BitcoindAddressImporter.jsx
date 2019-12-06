import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { bitcoindImportMulti, bitcoindGetAddressStatus } from '../bitcoind';
import { bitcoindParams } from '../bitcoind'
import { FormHelperText, Button, Box, Switch, FormControlLabel } from '@material-ui/core'

let interval;
class BitcoindAddressImporter extends React.Component {
  static propTypes = {
    addresses: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired,
  };

  state = {
    imported: false,
    importError: "",
    rescan: false,
    addressesError: "",
    addressPresent: false,
  };

  componentDidMount = () => {
    interval = setInterval(this.checkAddress, 5000)
  }

  componentWillUnmount = () => {
    clearInterval(interval);
  }

  render() {
    const { imported, importError, rescan, addressPresent, addressesError } = this.state;

    if (imported) {
      if (rescan) {
        return <FormHelperText>Initiated {this.pluralOrSingularAddress()} import, rescan of your node may take some time.</FormHelperText>
      } else {
        return <FormHelperText>Initiated {this.pluralOrSingularAddress()} import.</FormHelperText>
      }
    }


    return (
      <Box>
      { addressPresent && <p>I have address</p>}
      <FormHelperText error>{addressesError}</FormHelperText>
        <FormHelperText>Addresses used with bitcoind node must be imported to your node.  If you have not already, you can import now.</FormHelperText>
        <p>
          Import {this.pluralOrSingularAddress()} to your node?
          <Box component="span" ml={2}>
            <Button variant="contained" onClick={this.import}>Import</Button>
          </Box>
          <Box component="span" ml={2}>
            <FormControlLabel
              control={
                <Switch
                checked={rescan}
                onChange={this.handleRescan}
                color="secondary"
                />
              }
              label="Rescan"
            />

          </Box>
        </p>
        <FormHelperText error>{importError}</FormHelperText>

      </Box>
    )
  }

  pluralOrSingularAddress() {
    const { addresses } = this.props;
    return `address${addresses.length > 1 ? 'es' : ''}`
  }

  handleRescan = (e) => {
    this.setState({rescan: e.target.checked})
  }

  checkAddress = async (status) => {
    const { client, addresses } = this.props;
    const address = addresses[0] // TODO: loop
    console.log('this should check when status changes', client, status)

    try {
      await bitcoindGetAddressStatus({
        ...bitcoindParams(client),
        address
      })
      this.setState({addressPresent: true, addressError: ""});
      clearInterval(interval);
    } catch (e) {
      // e.status 401 e.statusText
      // e.status 500 e.data.error.message
      const status = e.response && e.response.status || 'unknown'
      this.setState({addressesError: status === 401 ? e.response.statusText : status === 500 ? e.response.data.error.message : "An unknown address error occured"})
      console.log(status, e.response)
    }

  }

  import = () => {
    const { addresses, client } = this.props;
    const { rescan } = this.state;
    const label = ""; // TODO: do we want to allow to set? or set to "caravan"?
    bitcoindImportMulti({
      ...bitcoindParams(client),
      ...{addresses, label, rescan}
    })
    .then(response => {
      const responseError = response.result.reduce((e, c) => {
        return (c.error && c.error.message) || e
      }, "")
      this.setState({
        importError: responseError,
        imported: responseError === ""
      })
    })
    .catch(e => {
      this.setState({
        importError: "Unable to import, check your settings and try again",
        imported: false
      });
    });
  }
}

function mapStateToProps(state) {
  return {
    client: state.client,
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(BitcoindAddressImporter);