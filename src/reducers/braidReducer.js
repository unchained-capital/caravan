import BigNumber from "bignumber.js";
import {
  RESET_NODES_SPEND,
  RESET_NODES_FETCH_ERRORS,
} from "../actions/walletActions";
import updateState from "./utils";

const intialSliceState = {
  present: true,
  bip32Path: "",
  publicKeys: [],
  multisig: {},
  address: "",
  balanceSats: new BigNumber(0),
  utxos: [],
  change: false,
  spend: false,
  fetchedUTXOs: false,
  fetchUTXOsError: "",
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

function getNextNode(state) {
  const nodes = Object.values(state.nodes);
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    if (node.balanceSats.isEqualTo(0) && !node.addressUsed) {
      return node;
    }
  }
  return null;
}

function updateSlice(state, action) {
  const slice = {
    ...intialSliceState,
    ...(state.nodes[action.value.bip32Path] || {}),
    ...action.value,
  };
  const newSlices = {};
  newSlices[slice.bip32Path] = slice;

  const updatedState = {
    ...state,
    ...{
      nodes: {
        ...state.nodes,
        ...newSlices,
      },
    },
  };
  if (typeof action.value.spend !== "undefined") {
    // TODO (BUCK): I'm not sure this works. If you change
    // the output value of a spend before spending, this will just
    // add the new value to the previous value. We also can't just
    // reset spendingSats because there might be multiple outputs
    updatedState.spendingSats = action.value.spend
      ? state.spendingSats.plus(slice.balanceSats)
      : state.spendingSats.minus(slice.balanceSats);
  }

  if (action.value.balanceSats) {
    const currentNodeBalance = state.nodes[slice.bip32Path]
      ? state.nodes[slice.bip32Path].balanceSats
      : BigNumber(0);
    updatedState.balanceSats = state.balanceSats.plus(
      slice.balanceSats.minus(currentNodeBalance)
    );
  }

  let trailingEmptyNodes = 0;
  let fetchUTXOsErrors = 0;
  const allBIP32Paths = Object.keys(updatedState.nodes);
  allBIP32Paths.sort((p1, p2) => {
    const p1Segments = (p1 || "").split("/");
    const p2Segments = (p2 || "").split("/");
    const p1Index = parseInt(p1Segments[2], 10);
    const p2Index = parseInt(p2Segments[2], 10);
    return p1Index - p2Index;
  });
  let nodeFoundWithValue = false;
  for (let i = 0; i < allBIP32Paths.length; i += 1) {
    const bip32Path = allBIP32Paths[allBIP32Paths.length - (i + 1)];
    const otherNode = updatedState.nodes[bip32Path];
    if (otherNode.fetchedUTXOs) {
      if (
        otherNode.balanceSats.isEqualTo(0) &&
        !otherNode.addressUsed &&
        !nodeFoundWithValue
      ) {
        trailingEmptyNodes += 1;
      } else nodeFoundWithValue = true;
    }
    if (otherNode.fetchUTXOsError !== "") {
      fetchUTXOsErrors += 1;
    }
  }
  updatedState.trailingEmptyNodes = trailingEmptyNodes;
  updatedState.fetchUTXOsErrors = fetchUTXOsErrors;
  updatedState.nextNode = getNextNode(updatedState);
  return updatedState;
}

function resetSpend(state) {
  const updatedState = { ...state };
  Object.values(updatedState.nodes).forEach((node) => {
    node.spend = false; // eslint-disable-line no-param-reassign
  });
  return updatedState;
}

export default (actionType) =>
  (state = initialState, action) => {
    switch (action.type) {
      case RESET_NODES_SPEND:
        return resetSpend(state);
      case RESET_NODES_FETCH_ERRORS:
        return updateState(state, {
          fetchUTXOsErrors: 0,
          nodes: Object.values(state.nodes).reduce((allNodes, thisNode) => {
            const updatedNodes = allNodes;
            updatedNodes[thisNode.bip32Path] = {
              ...thisNode,
              fetchUTXOsError: "",
            };
            return updatedNodes;
          }, {}),
        });
      case actionType:
        return updateSlice(state, action);
      default:
        return state;
    }
  };
