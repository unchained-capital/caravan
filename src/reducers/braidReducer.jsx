import BigNumber from "bignumber.js";

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
};

const initialState = {
  nodes: {},
  trailingEmptyNodes: 0,
  fetchUTXOsErrors: 0,
  balanceSats: new BigNumber(0),
  spendingSats: new BigNumber(0),
  autoSpend: false,
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
      // balanceSats: state.balanceSats.plus(node.balanceSats),
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
  for (let i=0; i < allBIP32Paths.length; i++) {
    const bip32Path = allBIP32Paths[allBIP32Paths.length - (i + 1)];
    const otherNode = updatedState.nodes[bip32Path];
    if (otherNode.fetchedUTXOs) {
      if (node.balanceSats.isEqualTo(0)) {
        trailingEmptyNodes++;
      };
    }
    if (otherNode.fetchUTXOsError !== '') {
      fetchUTXOsErrors++;
    }
  }
  updatedState.trailingEmptyNodes = trailingEmptyNodes;
  updatedState.fetchUTXOsErrors = fetchUTXOsErrors;
  return updatedState;
}

export default (actionType) => (state = initialState, action) => {
  switch (action.type) {
  case actionType:
    return updateNode(state, action);
  default:
    return state;
  }
};
