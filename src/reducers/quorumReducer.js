import { Network, P2SH, multisigBIP32Root } from "unchained-bitcoin";
import updateState from "./utils";
import {
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME,
  RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY_ROOT_FINGERPRINT,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_VISIBLE,
} from "../actions/extendedPublicKeyImporterActions";
import {
  SET_TOTAL_SIGNERS,
  SET_NETWORK,
  SET_ADDRESS_TYPE,
} from "../actions/settingsActions";

function fingerprint(state) {
  const timestamp = new Date().getTime().toString();
  const extendedPublicKeys = Object.values(state.extendedPublicKeyImporters)
    .map(
      (extendedPublicKeyImporter) => extendedPublicKeyImporter.extendedPublicKey
    )
    .join("");
  return `${timestamp}-${extendedPublicKeys}`;
}

const initialExtendedPublicKeyImporterState = (name = "") => ({
  name,
  bip32Path: multisigBIP32Root(P2SH, Network.MAINNET),
  bip32PathModified: false,
  method: "",
  extendedPublicKey: "",
  rootXfp: "",
  finalized: false,
  conflict: false,
});

function createInitialState() {
  const extendedPublicKeyImporters = [...Array(4).keys()]
    .slice(1)
    .reduce((importers, index) => {
      return {
        ...importers,
        [index]: initialExtendedPublicKeyImporterState(
          `Extended Public Key ${index}`
        ),
      };
    }, {});

  return {
    extendedPublicKeyImporters,
    defaultBIP32Path: multisigBIP32Root(P2SH, Network.MAINNET),
    network: Network.MAINNET,
    addressType: P2SH,
    fingerprint: "",
    finalizedNetwork: "",
    finalizedAddressType: "",
    configuring: true,
  };
}

function setConflict(extendedPublicKeyImporter, state) {
  if (state.finalizedNetwork) {
    const networkConflict = state.finalizedNetwork !== state.network;
    const addressTypeConflict =
      state.finalizedAddressType !== state.addressType &&
      extendedPublicKeyImporter.method !== "text";
    // eslint-disable-next-line no-param-reassign
    extendedPublicKeyImporter.conflict = networkConflict || addressTypeConflict;
  }
}

function updateExtendedPublicKeyImporterState(state, action, field) {
  const extendedPublicKeyImporterChange = {};
  extendedPublicKeyImporterChange[field] = action.value;
  const newState = {
    ...state,
    ...{ nodes: {} },
  };
  newState.extendedPublicKeyImporters[action.number] = updateState(
    state.extendedPublicKeyImporters[action.number],
    extendedPublicKeyImporterChange
  );
  const importCount = Object.values(newState.extendedPublicKeyImporters).reduce(
    (sum, current) => {
      return sum + current.finalized;
    },
    0
  );
  if (
    importCount === Object.keys(newState.extendedPublicKeyImporters).length &&
    field === "finalized" &&
    Object.values(newState.extendedPublicKeyImporters).every(
      (xpub) => !xpub.conflict
    )
  ) {
    newState.configuring = false;
  }
  setConflict(newState.extendedPublicKeyImporters[action.number], state);
  return updateState(newState, { fingerprint: fingerprint(newState) });
}

function updateTotalSigners(state, action) {
  const totalSigners = action.value;
  const extendedPublicKeyImporters = {};
  for (
    let extendedPublicKeyImporterNum = 1;
    extendedPublicKeyImporterNum <= totalSigners;
    extendedPublicKeyImporterNum += 1
  ) {
    extendedPublicKeyImporters[extendedPublicKeyImporterNum] =
      state.extendedPublicKeyImporters[extendedPublicKeyImporterNum] ||
      initialExtendedPublicKeyImporterState(
        `Extended Public Key ${extendedPublicKeyImporterNum}`
      );
  }
  let finalizedCount = 0;

  Object.keys(extendedPublicKeyImporters).forEach((index) => {
    const importer = extendedPublicKeyImporters[index];
    if (importer.finalized) finalizedCount += 1;
  });

  return {
    ...state,
    configuring: finalizedCount < totalSigners,
    ...{ extendedPublicKeyImporters },
  };
}

function updateImporterPaths(state, newState, bip32Path) {
  for (
    let extendedPublicKeyImporterNum = 1;
    extendedPublicKeyImporterNum <=
    Object.values(state.extendedPublicKeyImporters).length;
    extendedPublicKeyImporterNum += 1
  ) {
    const extendedPublicKeyImporter =
      newState.extendedPublicKeyImporters[extendedPublicKeyImporterNum];
    if (!extendedPublicKeyImporter.bip32PathModified) {
      if (!extendedPublicKeyImporter.finalized)
        extendedPublicKeyImporter.bip32Path = bip32Path;
    }
    setConflict(extendedPublicKeyImporter, newState);
  }
}

function updateNetwork(state, action) {
  const { addressType } = state;
  const network = action.value;
  const bip32Path = multisigBIP32Root(addressType, network);
  const newState = { ...state, ...{ network, defaultBIP32Path: bip32Path } };
  updateImporterPaths(state, newState, bip32Path);
  return newState;
}

function updateAddressType(state, action) {
  const addressType = action.value;
  const { network } = state;
  const bip32Path = multisigBIP32Root(addressType, network);
  const newState = {
    ...state,
    ...{ addressType, defaultBIP32Path: bip32Path },
  };
  updateImporterPaths(state, newState, bip32Path);
  return newState;
}

function updateFinalizedSettings(state, action) {
  const newState = { ...state };
  if (action.value === true && state.finalizedNetwork === "") {
    newState.finalizedNetwork = state.network;
    newState.finalizedAddressType = state.addressType;
  } else if (action.value === false && state.finalizedNetwork !== "") {
    const finalizedCount = Object.values(
      state.extendedPublicKeyImporters
    ).reduce((count, importer) => {
      if (importer.finalized === true) return count + 1;
      return count;
    }, 0);
    if (finalizedCount === 1) {
      // last one to be removed
      newState.finalizedNetwork = "";
      newState.finalizedAddressType = "";
      Object.values(newState.extendedPublicKeyImporters).forEach(
        // eslint-disable-next-line no-param-reassign,no-return-assign
        (importer) => (importer.conflict = false)
      );
    }
  }
  return newState;
}

export default (state = createInitialState(), action) => {
  switch (action.type) {
    case SET_NETWORK:
      return updateNetwork(state, action);
    case SET_ADDRESS_TYPE:
      return updateAddressType(state, action);
    case SET_TOTAL_SIGNERS:
      return updateTotalSigners(state, action);
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME:
      return updateExtendedPublicKeyImporterState(state, action, "name");
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH:
      return updateExtendedPublicKeyImporterState(
        updateExtendedPublicKeyImporterState(state, action, "bip32Path"),
        { number: action.number, value: true },
        "bip32PathModified"
      );
    case RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH:
      return updateExtendedPublicKeyImporterState(
        updateExtendedPublicKeyImporterState(
          state,
          { number: action.number, value: state.defaultBIP32Path },
          "bip32Path"
        ),
        { number: action.number, value: false },
        "bip32PathModified"
      );
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD:
      return updateExtendedPublicKeyImporterState(state, action, "method");
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY:
      return updateExtendedPublicKeyImporterState(
        state,
        action,
        "extendedPublicKey"
      );
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY_ROOT_FINGERPRINT:
      return updateExtendedPublicKeyImporterState(state, action, "rootXfp");
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED:
      return updateExtendedPublicKeyImporterState(
        updateFinalizedSettings(state, action),
        action,
        "finalized"
      );
    case SET_EXTENDED_PUBLIC_KEY_IMPORTER_VISIBLE:
      return { ...state, ...{ configuring: action.value } };
    default:
      return state;
  }
};
