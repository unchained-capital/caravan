import React from 'react';
import BigNumber from "bignumber.js";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import Copyable from "../Copyable";
import {
  Row,
  Col,
  Table,
  Form,
  Button,
} from 'react-bootstrap';
import ReactPaginate from "react-paginate";
import Node from "./Node";

class NodeSet extends React.Component {

  static propTypes = {
    depositNodes: PropTypes.object.isRequired,
    changeNodes: PropTypes.object.isRequired,
    addNode: PropTypes.func.isRequired,
  };

  state = {
    page: 1,
    nodesPerPage: 10,
    change: false,
  };

  render() {
    const {page, change} = this.state;
    return (
      <Form>
        <div className="text-center">
          <Table hover size="sm">
            <thead>
              <tr>
                <th>Spend?</th>
                <th>BIP32 Path</th>
                <th>Balance</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {this.renderNodes()}
            </tbody>
          </Table>
          <Row>
            <Col md={6}>
              <ReactPaginate
                pageCount={this.pageCount()}
                containerClassName="pagination"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                activeClassName="active"
                onPageChange={this.handlePageChange}
                forcePage={page - 1}
              />
            </Col>
            <Col md={2}>
              {page === this.pageCount() && <Button type="button" variant="secondary" onClick={this.generateAnotherPage}>More</Button>}
            </Col>
            <Col md={4}>
              <Button type="button" variant="primary" onClick={this.toggleChange}>{change ? "View Deposits" : "View Change"}</Button>
            </Col>
          </Row>
          
        </div>
      </Form>
    );
  }

  renderNodes = () => {
    const {page, nodesPerPage, change} = this.state;
    const {addNode} = this.props;
    const startingIndex = (page - 1) * nodesPerPage;
    const nodesRows = [];
    for (let index=0; index < nodesPerPage; index++) {
      const bip32Path = this.bip32Path(startingIndex + index);
      const nodeRow = <Node key={bip32Path} bip32Path={bip32Path} addNode={addNode} />;
      nodesRows.push(nodeRow);
    }
    return nodesRows;
  }

  handlePageChange = (data) => {
    const {selected} = data;
    const page = selected + 1;
    this.setState({page});
  }

  bip32Path = (index) => {
    const {change} = this.state;
    const changePath = (change ? "1" : "0");
    return `m/${changePath}/${index}`;
  }

  pageCount = () => {
    const {changeNodes, depositNodes} = this.props;
    const {nodesPerPage, change} = this.state;
    return Math.ceil(Object.keys(change ? changeNodes : depositNodes).length / nodesPerPage);
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
    this.setState({change: (!change), page: 1});
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
