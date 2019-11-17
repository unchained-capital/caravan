import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { bitcoindImportMulti } from '../bitcoind';
import { bitcoindParams } from '../blockchain'
import { FormHelperText, Button, Box } from '@material-ui/core'

class BitcoindAddressImporter extends React.Component {
  static propTypes = {
    addresses: PropTypes.array.isRequired,
    client: PropTypes.object.isRequired,
    rescan: PropTypes.bool.isRequired,
  };

  state = {
    imported: false,
    importError: "",
  };

  render() {
    const { addresses, rescan } = this.props;
    const { imported, importError} = this.state;
    if (imported) {
      if (rescan) {
        return <FormHelperText>Initiated {this.pluralOrSingularAddress()} import, rescan of your node may take some time.</FormHelperText>
      } else {
        return <FormHelperText>Initiated {this.pluralOrSingularAddress()} import.</FormHelperText>
      }
    }
    return (
      <Box>
        <FormHelperText>Addresses used with bitcoind node must be imported to your node.  If you have not already, you can import now.</FormHelperText>
        <p>
          Import {this.pluralOrSingularAddress()} to your node? <code>{addresses.join(", ")}</code>
          <Box component="span" ml={2}>
            <Button variant="contained" onClick={this.import}>Import</Button>
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

  import = () => {
    const { addresses, client, rescan } = this.props;
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