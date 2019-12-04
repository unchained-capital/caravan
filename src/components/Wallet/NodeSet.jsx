import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import {
  Button,
  Box, Grid,
  Table, TableHead, TableBody,
  TableRow, TableCell, TablePagination,
} from '@material-ui/core';
import Node from "./Node";

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
  };

  render() {
    const {page, change, nodesPerPage} = this.state;
    const {spending, canLoad} = this.props
    return (
      <Box>
      <Table>
            <TableHead>
              <TableRow>
                {spending && <TableCell>Spend?</TableCell>}
                <TableCell>BIP32 Path</TableCell>
                <TableCell>UTXOs</TableCell>
                <TableCell>Balance</TableCell>
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

        </Box>
    );
  }

  getNodeSet = () => {
    const {spending, changeNodes, depositNodes} = this.props;
    const {change} = this.state;

    const nodes = change ? changeNodes : depositNodes
    const nodeSet = spending ? Object.values(nodes)
      .filter(node => node.balanceSats.isGreaterThan(0))
      .reduce((nodesObject, currentNode) => {
        nodesObject[currentNode.bip32Path] = currentNode;
        return nodesObject;
      },{})
      : nodes;
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
    console.log('rows per page change', e)
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

  generateAnotherPage = () => {
    const {addNode, depositNodes, changeNodes} = this.props;
    const {change, nodesPerPage, page} = this.state;
    const startingIndex = Object.keys(change ? changeNodes : depositNodes).length;
    for (let index=0; index < nodesPerPage + (nodesPerPage - (startingIndex % nodesPerPage)); index++) {
      const bip32path = this.bip32Path(startingIndex + index);
      addNode(change, bip32path);
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
    spending: state.wallet.info.spending,
  };
}

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeSet);
