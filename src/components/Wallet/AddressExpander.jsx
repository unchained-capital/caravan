import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  Grid,
  ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary
} from '@material-ui/core';
import UTXOSet from "../Spend/UTXOSet";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MultisigDetails from "../MultisigDetails";
import Copyable from "../Copyable";
import styles from '../Spend//styles.module.scss';
import {
  blockExplorerAddressURL,
} from 'unchained-bitcoin';
import {
  externalLink,
} from "../../utils";
import LaunchIcon from '@material-ui/icons/Launch';



class AddressExpander extends React.Component {

  addressContent = () => {
      const {multisig, addressUsed, balanceSats} = this.props.node;
      const {network} = this.props;
      return (
        <div>
          <Copyable text={multisig.address}>
            <code className={addressUsed && balanceSats.isEqualTo(0) ? styles.spent : ""}>{multisig.address}</code>
            </Copyable>
          &nbsp;
          {externalLink(blockExplorerAddressURL(multisig.address, network), <LaunchIcon onClick={e => e.stopPropagation()} />)}
        </div>
      )
    }

    render = () => {
      const {bip32Path, utxos,  balanceSats, multisig} = this.props.node;
      return (
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id={'address-header'+bip32Path}
          >
            {this.addressContent()}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container>
          { balanceSats.isGreaterThan(0) &&
            <Grid item md={12}>
              <UTXOSet
                inputs={utxos}
                inputsTotalSats={balanceSats}
              />
            </Grid>
            }
            {this.renderAddressDetails()}
          </Grid>
        </ExpansionPanelDetails>

      </ExpansionPanel>  )

    }

    renderAddressDetails = () => {
      const {utxos,  multisig, bip32Path} = this.props.node;
      if (utxos.length === 0)
        return (
          <Grid item md={12}>
            <MultisigDetails multisig={multisig} />
          </Grid>
        )
      else return (
        <Grid item md={12}>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id={'address-header'+bip32Path}
          >
          Multisig Details
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container>
            <Grid item md={12}>
              <MultisigDetails multisig={multisig} />
            </Grid>
          </Grid>
        </ExpansionPanelDetails>

      </ExpansionPanel>
      </Grid>

      )
    }

}


function mapStateToProps(state, ownProps) {
  return {
    network: state.settings.network,
  }
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AddressExpander);
