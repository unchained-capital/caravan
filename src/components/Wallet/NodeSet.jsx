import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BigNumber from "bignumber.js";
import {
  fetchAddressUTXOs,
  getAddressStatus,
} from "../../blockchain";

// Components
import {
  Button,
  FormGroup, FormControlLabel, Checkbox, FormLabel,
  Grid, Box,
  Table, TableHead, TableBody,
  TableRow, TableCell, TablePagination, TableSortLabel,
} from '@material-ui/core';
import Node from "./Node";
import BitcoindAddressImporter from '../BitcoindAddressImporter';
import { WALLET_MODES } from '../../actions/walletActions';

class NodeSet extends React.Component {

  static propTypes = {
    depositNodes: PropTypes.object.isRequired,
    changeNodes: PropTypes.object.isRequired,
    canLoad: PropTypes.bool,
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
  };

  state = {
    page: 0,
    nodesPerPage: 10,
    change: false,
    spend: false,
    filterIncludeSpent: false,
    filterIncludeZeroBalance: false,
    orderBy: "bip32Path",
    orderDir: "asc"
  };

  unknownAddresses = [];

  render() {
    const {page, nodesPerPage, change, orderBy, orderDir} = this.state;
    const {walletMode, canLoad, client} = this.props
    const spending = walletMode === WALLET_MODES.SPEND;
    const useAddressImporter = !spending && client.type === "private";

    if (useAddressImporter) {
      this.unknownAddresses = this.getUnknownAddressNodes()
        .map(node => node.multisig.address) ;
    }
    return (
      <Grid item md={12}>
        { useAddressImporter &&
          <BitcoindAddressImporter
            addresses={this.unknownAddresses}
            importCallback={this.addressesImported}
            />
        }
      <Table style={{tableLayout: "fixed"}}>
            <TableHead>
              <TableRow>
                {spending && <TableCell width={62}>Spend?</TableCell>}
                <TableCell width={106}>
                  <TableSortLabel
                    active={orderBy === "bip32Path"}
                    direction={orderDir}
                    onClick={() => this.sortAddresses("bip32Path")}
                  >BIP32 Path</TableSortLabel>

                </TableCell>
                <TableCell width={78}>
                  <TableSortLabel
                    active={orderBy === "utxos"}
                    direction={orderDir}
                    onClick={() => this.sortAddresses("utxos")}
                  >UTXOs</TableSortLabel>

                </TableCell>
                <TableCell width={82}>
                  <TableSortLabel
                    active={orderBy === "balanceSats"}
                    direction={orderDir}
                    onClick={() => this.sortAddresses("balanceSats")}
                  >Balance</TableSortLabel>

                </TableCell>
                <TableCell width={82}>
                  <TableSortLabel
                    active={orderBy === "time"}
                    direction={orderDir}
                    onClick={() => this.sortAddresses("time")}
                  >Date</TableSortLabel>

                </TableCell>
                <TableCell>Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderNodes()}
            </TableBody>
          </Table>
          <Grid container>
            <Grid item md={6}>
              <TablePagination
                component="div"
                count={this.rowCount()}
                rowsPerPage={nodesPerPage}
                page={page}
                backIconButtonProps={{
                  'aria-label': 'previous page',
                }}
                nextIconButtonProps={{
                  'aria-label': 'next page',
                }}
                onChangePage={this.handlePageChange}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </Grid>
            <Grid item md={2}>
              {canLoad && page === this.pageCount() - 1 && <Button type="button" variant="contained" color="secondary" onClick={this.generateAnotherPage}>More</Button>}
            </Grid>
            <Grid item md={4}>
              <Button type="button" variant="contained" color="primary" onClick={this.toggleChange}>{change ? "View Deposits" : "View Change"}</Button>
            </Grid>
          </Grid>
          {!spending && this.renderFilters()}

        </Grid>
    );
  }

  sortAddresses = (key) => {
    const {orderBy, orderDir} = this.state;
    if (key === orderBy) {
      this.setState({page:0, orderDir: orderDir === "asc" ? "desc" : "asc"})
    } else {
      this.setState({page:0, orderBy: key})
    }
  }

  renderFilters = () => {
    const { filterIncludeSpent, filterIncludeZeroBalance } = this.state
    return (
    <FormGroup row>
      <FormLabel component="h2"><Box mr={3}>Show Additional</Box></FormLabel>
      <FormControlLabel control={
        <Checkbox
          checked={filterIncludeSpent}
          value="filterIncludeSpent"
          onChange={this.filterAddresses}
        />} label="Spent Addresses" />
      <FormControlLabel control={
        <Checkbox
          checked={filterIncludeZeroBalance}
          value="filterIncludeZeroBalance"
          onChange={this.filterAddresses}
        />} label="Zero Balance" />
    </FormGroup>
    )
  }

  filterAddresses = (event, checked) => {
    this.setState({[event.target.value]: checked, page: 0});
  }

  getUnknownAddressNodes = () => {
    const {changeNodes, depositNodes} = this.props
    return Object.values(depositNodes).concat(Object.values(changeNodes))
    .filter(node => !node.addressKnown);
  }


  addressesImported = async result => {
    // this will give me an array [{success: true/false}...]
    // need to loop through and mark nodes as addressKnown
    const { updateNode, client, network } = this.props;
    const nodes = []
    const unknown = this.getUnknownAddressNodes();
    result.forEach((addr, i) => {
      if (addr.success) nodes.push(unknown[i]); // can now set to known and refresh status
    });

    nodes.forEach(async node => {
      const utxos = await fetchAddressUTXOs(node.multisig.address, network, client);
      const addressStatus = await getAddressStatus(node.multisig.address, network, client);
      let updates;
      if (utxos) {
        const balanceSats = utxos
              .map((utxo) => utxo.amountSats)
              .reduce(
                (accumulator, currentValue) => accumulator.plus(currentValue),
                new BigNumber(0));
        updates = {balanceSats, utxos, fetchedUTXOs: true, fetchUTXOsError: ''}
      }


      updateNode(node.change, {
        bip32Path: node.bip32Path,
        addressKnown: true,
        ...updates,
        addressStatus,
      });
    });
  }

  getNodeSet = () => {
    const { changeNodes, depositNodes} = this.props;
    const { change, filterIncludeSpent, filterIncludeZeroBalance, orderBy, orderDir } = this.state
    const nodes = change ? changeNodes : depositNodes

    let nodeSet = []
    Object.values(nodes).forEach(node => {
      if (node.balanceSats.isGreaterThan(0)) {
        nodeSet.push(node);
      } else if (filterIncludeZeroBalance && node.balanceSats.isEqualTo(0) && !node.addressUsed) {
        nodeSet.push(node);
      } else if (filterIncludeSpent && node.addressUsed) {
        nodeSet.push(node);
      }
    })

    nodeSet = nodeSet.sort((a, b) => {
      const direction = orderDir === "asc" ? 1 : -1
      if (orderBy === "bip32Path") {
        const aint = parseInt(a.bip32Path.split("/").reverse()[0],10)
        const bint = parseInt(b.bip32Path.split("/").reverse()[0],10)
        return aint > bint ? direction : -direction
      } else if (orderBy === "balanceSats") {
        if (a.balanceSats.isEqualTo(b.balanceSats)) return 0
        else return a.balanceSats.isGreaterThan(b.balanceSats) ?  direction : -direction
      } else if (orderBy === "utxos") {
        if (a.utxos.length === b.utxos.length) return 0
        else return a.utxos.length > b.utxos.length ?  direction : -direction
      } else if (orderBy === "time") {
        if (a.utxos.length === 0) {
          return b.utxos.length === 0 ? 0 : direction
        }
        if (b.utxos.length === 0) {
          return a.utxos.length === 0 ? 0 : -direction
        }
        const amin = Math.min(...a.utxos.map(utxo => utxo.time));
        const bmin = Math.min(...b.utxos.map(utxo => utxo.time));
        if (isNaN(amin) && isNaN(bmin)) return 0
        if (isNaN(amin)) return direction;
        if (isNaN(bmin)) return -direction;
        return amin > bmin ? direction : -direction
      }
    })

    nodeSet = nodeSet.reduce((nodesObject, currentNode) => {
        nodesObject[currentNode.bip32Path] = currentNode;
        return nodesObject;
    },{});

    return nodeSet
  }

  renderNodes = () => {
    const {page, nodesPerPage, change, spend} = this.state;
    const {addNode, updateNode} = this.props;
    const startingIndex = (page) * nodesPerPage;
    const nodesRows = [];
    const nodeSet = this.getNodeSet();
    for (let index=0; index < nodesPerPage; index++) {
      const whichOne = startingIndex + index;
      if(whichOne > Object.keys(nodeSet).length -1) break;
      const bip32Path = Object.values(nodeSet)[whichOne].bip32Path;
      const nodeRow = <Node
        key={bip32Path}
        bip32Path={bip32Path}
        addNode={addNode}
        updateNode={updateNode}
        change={change}
        spend={spend}
        />;
      nodesRows.push(nodeRow);
    }
    return nodesRows;
  }

  handlePageChange = (e, selected) => {
    const page = selected // + 1;
    this.setState({page});
  }

  handleChangeRowsPerPage = (e) => {
    this.setState({nodesPerPage: e.target.value, page: 0});
  }

  bip32Path = (index) => {
    const {change} = this.state;
    const changePath = (change ? "1" : "0");
    return `m/${changePath}/${index}`;
  }

  pageCount = () => {
    const {nodesPerPage} = this.state;
    return Math.ceil(this.rowCount() / nodesPerPage);
  }

  rowCount = () => {
    const nodeSet = this.getNodeSet();
    return Object.keys(nodeSet).length;
  }

  generateAnotherPage = async () => {
    const {addNode, depositNodes, changeNodes} = this.props;
    const {change, nodesPerPage, page} = this.state;
    const startingIndex = Object.keys(change ? changeNodes : depositNodes).length;
    for (let index=0; index < nodesPerPage + (nodesPerPage - (startingIndex % nodesPerPage)); index++) {
      const bip32path = this.bip32Path(startingIndex + index);
      await addNode(change, bip32path);
    }
    if (startingIndex % nodesPerPage === 0) // otherwise we will be filling this page first
      this.setState({page: page + 1});
  }

  toggleChange = () => {
    const {change} = this.state;
    this.setState({change: (!change), page: 0});
  }

}

function mapStateToProps(state) {
  return {
    changeNodes: state.wallet.change.nodes,
    depositNodes: state.wallet.deposits.nodes,
    walletMode: state.wallet.info.walletMode,
    client: state.client,
    ...state.settings,

  };
}

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeSet);
