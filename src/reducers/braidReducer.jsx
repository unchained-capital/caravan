import BigNumber from "bignumber.js";
import { 
  RESET_NODES_SPEND, 
  SPEND_NODES, 
  RESET_NODES_FETCH_ERRORS, 
  RESET_WALLET 
} from "../actions/walletActions";
import { updateState } from './utils';

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
    // TODO (BUCK): I'm not sure this works. If you change
    // the output value of a spend before spending, this will just
    // add the new value to the previous value. We also can't just
    // reset spendingSats because there might be multiple outputs
    updatedState.spendingSats = action.value.spend ?
      state.spendingSats.plus(node.balanceSats) :
      state.spendingSats.minus(node.balanceSats);
  }

  if (action.value.balanceSats) {
    const currentNodeBalance = state.nodes[node.bip32Path] ? state.nodes[node.bip32Path].balanceSats : BigNumber(0)
    updatedState.balanceSats = state.balanceSats.plus(node.balanceSats.minus(currentNodeBalance))
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
  case RESET_WALLET:
    return initialState
  case RESET_NODES_SPEND:
    return resetSpend(state);
  case SPEND_NODES:
    return spendNodes(state);
  case RESET_NODES_FETCH_ERRORS:
    return updateState(state, {
      fetchUTXOsErrors: 0, 
      nodes: Object.values(state.nodes).reduce((allNodes, thisNode) => {
        allNodes[thisNode.bip32Path] = {...thisNode, fetchUTXOsError: ""}
        return allNodes
      },{})
    });
  case actionType:
    return updateNode(state, action);
  default:
    return state;
  }
};
