import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

// Components
import NodeSet from "./NodeSet";

const WalletView = (props) => {
  const { addNode, updateNode } = props;

  return <NodeSet addNode={addNode} updateNode={updateNode} />;
};

WalletView.propTypes = {
  addNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return { ...state.wallet };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WalletView);
