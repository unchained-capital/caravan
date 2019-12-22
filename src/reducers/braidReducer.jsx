import BigNumber from "bignumber.js";
import { RESET_NODES_SPEND, SPEND_NODES } from "../actions/walletActions";

const initialNodeState = {
  present: true,
  bip32Path: '',
  publicKeys: [],
  multisig: {},
  address: '',
  balanceSats: new BigNumber(0),
  utxos: [],
  change: false,
  spend: false,
  fetchedUTXOs: false,
  fetchUTXOsError: '',
  addressUsed: false,
  addressKnown: true,
};

const initialState = {
  nodes: {},
  trailingEmptyNodes: 0,
  fetchUTXOsErrors: 0,
  balanceSats: new BigNumber(0),
  spendingSats: new BigNumber(0),
  autoSpend: false,
  nextNode: null,
};

function updateNode(state, action) {
  const node = {
    ...initialNodeState,
    ...(state.nodes[action.value.bip32Path] || {}),
    ...action.value,
  };
  const newNodes = {};
  newNodes[node.bip32Path] = node;

  const updatedState = {
    ...state,
    ...{
      nodes: {
        ...state.nodes,
        ...newNodes,
      },
    },
  };

  if (typeof action.value.spend !== 'undefined') {
    updatedState.spendingSats = action.value.spend ?
      state.spendingSats.plus(node.balanceSats) :
      state.spendingSats.minus(node.balanceSats);
  }

  if (action.value.balanceSats) {
    updatedState.balanceSats = state.balanceSats.plus(node.balanceSats)
  }

  let trailingEmptyNodes = 0;
  let fetchUTXOsErrors = 0;
  const allBIP32Paths = Object.keys(updatedState.nodes);
  allBIP32Paths.sort((p1, p2) => {
    const p1Segments = (p1 || '').split('/');
    const p2Segments = (p2 || '').split('/');
    const p1Index = parseInt(p1Segments[2]);
    const p2Index = parseInt(p2Segments[2]);
    return p1Index - p2Index;
  });
  let nodeFoundWithValue = false
  for (let i=0; i < allBIP32Paths.length; i++) {
    const bip32Path = allBIP32Paths[allBIP32Paths.length - (i + 1)];
    const otherNode = updatedState.nodes[bip32Path];
    if (otherNode.fetchedUTXOs) {
      if (otherNode.balanceSats.isEqualTo(0) && !otherNode.addressUsed && !nodeFoundWithValue) {
        trailingEmptyNodes++;
      } else nodeFoundWithValue = true
    }
    if (otherNode.fetchUTXOsError !== '') {
      fetchUTXOsErrors++;
    }
  }
  updatedState.trailingEmptyNodes = trailingEmptyNodes;
  updatedState.fetchUTXOsErrors = fetchUTXOsErrors;
  updatedState.nextNode = getNextNode(updatedState);
  return updatedState;
}

function getNextNode(state) {
  const nodes = Object.values(state.nodes)
  for (let i=0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.balanceSats.isEqualTo(0) && !node.addressUsed) {
      return node;
    }
  }
  return null;
}

function spendNodes(state) {
  const updatedState = {...state };
  Object.values(updatedState.nodes).forEach(node => {
    if (node.spend) {
      updatedState.balanceSats = updatedState.balanceSats.minus(node.balanceSats);
      node.balanceSats = new BigNumber(0);
      node.spend = false;
      node.utxos = [];
    }
  })
  return updatedState;

}

function resetSpend(state) {
  const updatedState = {...state };
  Object.values(updatedState.nodes).forEach(node => {
    node.spend = false;
  })
  return updatedState;
}

export default (actionType) => (state = initialState, action) => {
  switch (action.type) {
  case RESET_NODES_SPEND:
    return resetSpend(state);
  case SPEND_NODES:
    return spendNodes(state);
  case actionType:
    return updateNode(state, action);
  default:
    return state;
  }
};
