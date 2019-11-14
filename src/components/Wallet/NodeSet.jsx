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
    addNode: PropTypes.func.isRequired,
  };

  state = {
    page: 0,
    nodesPerPage: 10,
    change: false,
    spend: false,
  };

  render() {
    const {page, change, nodesPerPage} = this.state;
    return (
      <Box>
      <Table>
            <TableHead>
              <TableRow>
                <TableCell>Spend?</TableCell>
                <TableCell>BIP32 Path</TableCell>
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
              {page === this.pageCount() - 1 && <Button type="button" variant="contained" color="secondary" onClick={this.generateAnotherPage}>More</Button>}
            </Grid>
            <Grid item md={4}>
              <Button type="button" variant="contained" color="primary" onClick={this.toggleChange}>{change ? "View Deposits" : "View Change"}</Button>
            </Grid>
          </Grid>

        </Box>
    );
  }

  renderNodes = () => {
    const {page, nodesPerPage, change, spend} = this.state;
    const {addNode} = this.props;
    const startingIndex = (page) * nodesPerPage;
    const nodesRows = [];
    for (let index=0; index < nodesPerPage; index++) {
      const bip32Path = this.bip32Path(startingIndex + index);
      const nodeRow = <Node
        key={bip32Path}
        bip32Path={bip32Path}
        addNode={addNode}
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
    const {changeNodes, depositNodes} = this.props;
    const {change} = this.state;
    return Object.keys(change ? changeNodes : depositNodes).length;
  }

  generateAnotherPage = () => {
    const {addNode} = this.props;
    const {change, nodesPerPage, page} = this.state;
    const startingIndex = nodesPerPage * this.pageCount();
    for (let index=0; index < nodesPerPage; index++) {
      const bip32path = this.bip32Path(startingIndex + index);
      addNode(change, bip32path);
    }
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
  };
}

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(NodeSet);
