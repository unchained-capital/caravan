import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Components
import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormLabel,
  Grid,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableSortLabel,
} from "@mui/material";
import Node from "./Node";
import { WALLET_MODES } from "../../actions/walletActions";

class NodeSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      nodesPerPage: 10,
      select: false,
      filterIncludeSpent: false,
      filterIncludeZeroBalance: false,
      orderBy: "bip32Path",
      orderDir: "asc",
    };
  }

  sortAddresses = (key) => {
    const { orderBy, orderDir } = this.state;
    if (key === orderBy) {
      this.setState({ page: 0, orderDir: orderDir === "asc" ? "desc" : "asc" });
    } else {
      this.setState({ page: 0, orderBy: key });
    }
  };

  renderFilters = () => {
    const { filterIncludeSpent, filterIncludeZeroBalance } = this.state;
    return (
      <FormGroup row>
        <FormLabel component="h2">
          <Box mr={3}>Show Additional</Box>
        </FormLabel>
        <FormControlLabel
          control={
            <Checkbox
              checked={filterIncludeSpent}
              value="filterIncludeSpent"
              onChange={this.filterAddresses}
            />
          }
          label="Spent Addresses"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={filterIncludeZeroBalance}
              value="filterIncludeZeroBalance"
              onChange={this.filterAddresses}
            />
          }
          label="Zero Balance"
        />
      </FormGroup>
    );
  };

  filterAddresses = (event, checked) => {
    this.setState({ [event.target.value]: checked, page: 0 });
  };

  getNodeSet = () => {
    const { changeNodes, depositNodes } = this.props;
    const { filterIncludeSpent, filterIncludeZeroBalance, orderBy, orderDir } =
      this.state;
    const nodes = Object.values(depositNodes)
      .concat(Object.values(changeNodes))
      .reduce((result, node) => {
        const returnValue = result;
        returnValue[node.bip32Path] = node;
        return returnValue;
      }, {});

    let nodeSet = [];
    Object.values(nodes).forEach((node) => {
      if (node.balanceSats.isGreaterThan(0)) {
        nodeSet.push(node);
      } else if (
        filterIncludeZeroBalance &&
        node.balanceSats.isEqualTo(0) &&
        !node.addressUsed
      ) {
        nodeSet.push(node);
      } else if (filterIncludeSpent && node.addressUsed) {
        nodeSet.push(node);
      }
    });

    nodeSet = nodeSet.sort((a, b) => {
      const direction = orderDir === "asc" ? 1 : -1;
      if (orderBy === "bip32Path") {
        if (a.change && !b.change) return direction;
        if (!a.change && b.change) return -direction;
        const aint = parseInt(a.bip32Path.split("/").reverse()[0], 10);
        const bint = parseInt(b.bip32Path.split("/").reverse()[0], 10);
        return aint > bint ? direction : -direction;
      }
      if (orderBy === "balanceSats") {
        if (a.balanceSats.isEqualTo(b.balanceSats)) return 0;
        return a.balanceSats.isGreaterThan(b.balanceSats)
          ? direction
          : -direction;
      }
      if (orderBy === "utxos") {
        if (a.utxos.length === b.utxos.length) return 0;
        return a.utxos.length > b.utxos.length ? direction : -direction;
      }
      if (orderBy === "time") {
        if (a.utxos.length === 0) {
          return b.utxos.length === 0 ? 0 : direction;
        }
        if (b.utxos.length === 0) {
          return a.utxos.length === 0 ? 0 : -direction;
        }
        const amin = Math.min(...a.utxos.map((utxo) => utxo.time));
        const bmin = Math.min(...b.utxos.map((utxo) => utxo.time));
        if (Number.isNaN(amin) && Number.Number.isNaN(bmin)) return 0;
        if (Number.isNaN(amin)) return direction;
        if (Number.isNaN(bmin)) return -direction;
        return amin > bmin ? direction : -direction;
      }
      return 0;
    });

    nodeSet = nodeSet.reduce((nodesObject, currentNode) => {
      const returnValue = nodesObject;
      returnValue[currentNode.bip32Path] = currentNode;
      return returnValue;
    }, {});

    return nodeSet;
  };

  renderNodes = () => {
    const { page, nodesPerPage, select } = this.state;
    const { addNode, updateNode } = this.props;
    const startingIndex = page * nodesPerPage;
    const nodesRows = [];
    const nodeSet = this.getNodeSet();
    for (let index = 0; index < nodesPerPage; index += 1) {
      const whichOne = startingIndex + index;
      if (whichOne > Object.keys(nodeSet).length - 1) break;
      const bip32Path = Object.values(nodeSet)[whichOne].bip32Path; // eslint-disable-line prefer-destructuring
      const change = Object.values(nodeSet)[whichOne].change; // eslint-disable-line prefer-destructuring
      const nodeRow = (
        <Node
          key={bip32Path}
          bip32Path={bip32Path}
          addNode={addNode}
          updateNode={updateNode}
          change={change}
          select={select}
        />
      );
      nodesRows.push(nodeRow);
    }
    return nodesRows;
  };

  handlePageChange = (e, selected) => {
    const page = selected; // + 1;
    this.setState({ page });
  };

  handleChangeRowsPerPage = (e) => {
    this.setState({ nodesPerPage: e.target.value, page: 0 });
  };

  pageCount = () => {
    const { nodesPerPage } = this.state;
    return Math.ceil(this.rowCount() / nodesPerPage);
  };

  rowCount = () => {
    const nodeSet = this.getNodeSet();
    return Object.keys(nodeSet).length;
  };

  render() {
    const { page, nodesPerPage, orderBy, orderDir } = this.state;
    const { walletMode } = this.props;
    const spending = walletMode === WALLET_MODES.SPEND;
    return (
      <Grid item md={12}>
        <Table style={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              {spending && <TableCell width={62}>Select</TableCell>}
              <TableCell width={106}>
                <TableSortLabel
                  active={orderBy === "bip32Path"}
                  direction={orderDir}
                  onClick={() => this.sortAddresses("bip32Path")}
                >
                  BIP32 Path
                </TableSortLabel>
              </TableCell>
              <TableCell width={78}>
                <TableSortLabel
                  active={orderBy === "utxos"}
                  direction={orderDir}
                  onClick={() => this.sortAddresses("utxos")}
                >
                  UTXOs
                </TableSortLabel>
              </TableCell>
              <TableCell width={82}>
                <TableSortLabel
                  active={orderBy === "balanceSats"}
                  direction={orderDir}
                  onClick={() => this.sortAddresses("balanceSats")}
                >
                  Balance
                </TableSortLabel>
              </TableCell>
              <TableCell width={98}>
                <TableSortLabel
                  active={orderBy === "time"}
                  direction={orderDir}
                  onClick={() => this.sortAddresses("time")}
                >
                  Last Used
                </TableSortLabel>
              </TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.renderNodes()}</TableBody>
        </Table>
        <Grid container>
          <Grid item md={6}>
            <TablePagination
              component="div"
              count={this.rowCount()}
              rowsPerPage={nodesPerPage}
              page={page}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onPageChange={this.handlePageChange}
              onRowsPerPageChange={this.handleChangeRowsPerPage}
            />
          </Grid>
        </Grid>
        {!spending && this.renderFilters()}
      </Grid>
    );
  }
}

NodeSet.propTypes = {
  depositNodes: PropTypes.shape({}).isRequired,
  changeNodes: PropTypes.shape({}).isRequired,
  addNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  walletMode: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    changeNodes: state.wallet.change.nodes,
    depositNodes: state.wallet.deposits.nodes,
    walletMode: state.wallet.common.walletMode,
    client: state.client,
    ...state.settings,
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(NodeSet);
