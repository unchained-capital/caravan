import React from 'react';
import { connect } from 'react-redux';

import {
  Grid, //Card,
  Menu, MenuItem,
  ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary
} from '@material-ui/core';
import UTXOSet from "../Spend/UTXOSet";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MultisigDetails from "../MultisigDetails";
import BitcoindAddressImporter from "../BitcoindAddressImporter";
import Copyable from "../Copyable";
import styles from '../Spend//styles.module.scss';
import {
  blockExplorerAddressURL,
} from 'unchained-bitcoin';
import {
  externalLink,
} from "../../utils";
import LaunchIcon from '@material-ui/icons/Launch';

const MODE_UTXO = 0;
const MODE_REDEEM = 1;
const MODE_CONFIRM = 2;
const MODE_WATCH = 3;
let anchor;

class AddressExpander extends React.Component {

  state = {
    expandMode: null,
    showMenu: false,
    showMenuIcon: false,
  }

  componentDidMount = () => {
    this.defaultMode();
  }

  addressContent = () => {
      const {multisig, addressUsed, balanceSats} = this.props.node;
      const {network, client} = this.props;
      const {expandMode, showMenuIcon} = this.state;
      return (
        <div style={{width: '100%'}}>
            <code className={addressUsed && balanceSats.isEqualTo(0) ? styles.spent : ""}>{multisig.address}</code>
          &nbsp;
          <Copyable text={multisig.address}>
            <FileCopyIcon></FileCopyIcon>
          </Copyable>
          {externalLink(blockExplorerAddressURL(multisig.address, network), <LaunchIcon onClick={e => e.stopPropagation()} />)}
          <MoreVertIcon  onClick={this.handleMenu} style={{float:'right', display: showMenuIcon ? 'block' : 'none'}}  aria-controls="address-menu" aria-haspopup="true"></MoreVertIcon>
          <Menu
            id="address-menu"
            anchorEl={anchor}
            keepMounted
            open={this.state.showMenu}
            onClose={this.handleClose}
          >
            {balanceSats.isGreaterThan(0) && <MenuItem selected={expandMode === MODE_UTXO} onClick={e => {this.setState({expandMode: MODE_UTXO});this.handleClose(e)}}>UTXOs</MenuItem>}
            <MenuItem selected={expandMode === MODE_REDEEM} onClick={e => {this.setState({expandMode: MODE_REDEEM});this.handleClose(e)}}>Scripts</MenuItem>
            <MenuItem selected={expandMode === MODE_CONFIRM} onClick={e => {this.setState({expandMode: MODE_CONFIRM});this.handleClose(e)}}>Confirm on Device</MenuItem>
            {client.type === 'private' && <MenuItem selected={expandMode === MODE_WATCH} onClick={e => {this.setState({expandMode: MODE_WATCH});this.handleClose(e)}}>Watch with bitcoind Node</MenuItem>}
          </Menu>
        </div>
      )
    }

    handleClose = (event) => {
      event.stopPropagation();
      this.setState({showMenu: false})
    }

    handleMenu = (event) => {
      event.stopPropagation();
      anchor = event.target;
      this.setState({showMenu: true})
    }

    panelExpand = (event, expanded) => {
      this.setState({showMenuIcon: expanded})
    }

    render = () => {
      const {bip32Path} = this.props.node;
        return (
          <ExpansionPanel onChange={this.panelExpand}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id={'address-header'+bip32Path}
            >
              {this.addressContent()}
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container>
                {this.expandContent()}
              </Grid>
            </ExpansionPanelDetails>

          </ExpansionPanel>  
        )
    }

    defaultMode = () => {
      const {balanceSats} = this.props.node;
      this.setState({expandMode: balanceSats.isGreaterThan(0) ? MODE_UTXO : MODE_REDEEM});
    }

    expandContent = () => {
      const {utxos,  balanceSats, multisig} = this.props.node;
      const {client} = this.props;
      const {expandMode} = this.state;

      if (client.type === 'public' && expandMode === MODE_WATCH)
        this.defaultMode();
      if (balanceSats.isEqualTo(0) && expandMode === MODE_UTXO)
        this.defaultMode();
      
      switch (this.state.expandMode) {
        case MODE_UTXO:
          return (
            <Grid item md={12}>
              <UTXOSet
                inputs={utxos}
                inputsTotalSats={balanceSats}
              />
            </Grid>
          )
        case MODE_REDEEM:
          return (
            <Grid item md={12}>
              <MultisigDetails multisig={multisig} showAddress={false} />
            </Grid>            
          )
        case MODE_CONFIRM:
          return (
            <Grid item md={12}>
              TBD
            </Grid>            
          )
        case MODE_WATCH:
          return (
            <Grid item md={12}>
              <BitcoindAddressImporter addresses={[multisig.address]}/>
            </Grid>    
          )        
        default:
          return ""
      }
    }
}


function mapStateToProps(state, ownProps) {
  return {
    network: state.settings.network,
    client: state.client,
  }
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AddressExpander);
