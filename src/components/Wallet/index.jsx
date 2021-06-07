import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  satoshisToBitcoins,
  validateBIP32Index,
  validateBIP32Path,
  validateExtendedPublicKey,
} from "unchained-bitcoin";
import { Box, Button, FormHelperText, Grid } from "@material-ui/core";
import { downloadFile } from "../../utils";
import {
  resetWallet as resetWalletAction,
  updateChangeSliceAction,
  updateDepositSliceAction,
  updateWalletNameAction as updateWalletNameActionImport,
  updateWizardCurrentStep as updateWizardCurrentStepAction,
} from "../../actions/walletActions";
import { fetchSliceData as fetchSliceDataAction } from "../../actions/braidActions";
import walletSelectors from "../../selectors";
import { CARAVAN_CONFIG } from "./constants";
import WalletInfoCard from "./WalletInfoCard";
import WizardIntro from "../WizardIntro";
import NetworkPicker from "../NetworkPicker";
import QuorumPicker from "../QuorumPicker";
import AddressTypePicker from "../AddressTypePicker";
import ClientPicker from "../ClientPicker";
import StartingAddressIndexPicker from "../StartingAddressIndexPicker";
import WalletGenerator from "./WalletGenerator";
import ExtendedPublicKeyImporter from "./ExtendedPublicKeyImporter";
import WalletActionsPanel from "./WalletActionsPanel";
import {
  getUnknownAddresses,
  getUnknownAddressSlices,
  getWalletDetailsText,
} from "../../selectors/wallet";
import {
  setAddressType as setAddressTypeAction,
  setNetwork as setNetworkAction,
  setRequiredSigners as setRequiredSignersAction,
  setStartingAddressIndex as setStartingAddressIndexAction,
  setTotalSigners as setTotalSignersAction,
} from "../../actions/settingsActions";
import {
  setExtendedPublicKeyImporterBIP32Path as setExtendedPublicKeyImporterBIP32PathAction,
  setExtendedPublicKeyImporterExtendedPublicKey as setExtendedPublicKeyImporterExtendedPublicKeyAction,
  setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint as setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprintAction,
  setExtendedPublicKeyImporterFinalized as setExtendedPublicKeyImporterFinalizedAction,
  setExtendedPublicKeyImporterMethod as setExtendedPublicKeyImporterMethodAction,
  setExtendedPublicKeyImporterName as setExtendedPublicKeyImporterNameAction,
  setExtendedPublicKeyImporterVisible as setExtendedPublicKeyImporterVisibleAction,
} from "../../actions/extendedPublicKeyImporterActions";
import { wrappedActions } from "../../actions/utils";
import {
  SET_CLIENT_PASSWORD,
  SET_CLIENT_TYPE,
  SET_CLIENT_URL,
  SET_CLIENT_USERNAME,
} from "../../actions/clientActions";
import { clientPropTypes, slicePropTypes } from "../../proptypes";
import "./walletstyles.css";

class CreateWallet extends React.Component {
  static validateProperties(config, properties, key) {
    for (let index = 0; index < properties.length; index += 1) {
      const property = properties[index];
      const configObj = key !== "" ? config[key] : config;
      if (!Object.prototype.hasOwnProperty.call(configObj, property)) {
        return `Configuration missing property "${
          key !== "" ? `${key}.` : ""
        }${property}"`;
      }
    }
    return "";
  }

  static validateConfig(config) {
    const configProperties = [
      "name",
      "addressType",
      "network",
      "quorum",
      "extendedPublicKeys",
    ];
    const validProperties = CreateWallet.validateProperties(
      config,
      configProperties,
      ""
    );
    if (validProperties !== "") return validProperties;

    if (config.startingAddressIndex !== undefined) {
      const startingAddressIndexError = validateBIP32Index(
        String(config.startingAddressIndex),
        { mode: "unhardened " }
      ).replace("BIP32", "Starting Address");
      if (startingAddressIndexError !== "") return startingAddressIndexError;
    }

    if (config.client) {
      const clientProperties =
        config.client.type === "public"
          ? ["type"]
          : ["type", "url", "username"];
      const validClient = CreateWallet.validateProperties(
        config,
        clientProperties,
        "client"
      );
      if (validClient !== "") return validClient;
    }

    const quorumProperties = ["requiredSigners", "totalSigners"];
    const validQuorum = CreateWallet.validateProperties(
      config,
      quorumProperties,
      "quorum"
    );
    if (validQuorum !== "") return validQuorum;

    return CreateWallet.validateExtendedPublicKeys(
      config.extendedPublicKeys,
      config.network
    );
  }

  static validateExtendedPublicKeys(xpubs, network) {
    let tmpNetwork = network;
    if (network === "regtest") {
      tmpNetwork = "testnet";
    }
    const xpubFields = {
      name: (name, index) =>
        typeof name === "string"
          ? ""
          : `Extended public key ${index} name must be a string`,
      bip32Path: (bip32Path, index) => {
        if (xpubs[index - 1].method === "text") return "";
        if (typeof xpubs[index - 1].method === "undefined") return "";
        const pathError = validateBIP32Path(bip32Path);
        if (pathError !== "")
          return `Extended public key ${index} error: ${pathError}`;
        return "";
      },
      xpub: (xpub) => validateExtendedPublicKey(xpub, tmpNetwork),
      method: (method, index) => {
        if (
          [
            "trezor",
            "coldcard",
            "ledger",
            "hermit",
            "xpub",
            "text",
            undefined,
          ].includes(method)
        ) {
          return "";
        }
        return `Invalid method for extended public key ${index}`;
      },
    };

    const keys = Object.keys(xpubFields);
    const seen = [];
    for (let xpubIndex = 0; xpubIndex < xpubs.length; xpubIndex += 1) {
      if (!seen.includes(xpubs[xpubIndex].xpub)) {
        seen.push(xpubs[xpubIndex].xpub);
      } else {
        return "Duplicate xpub found.";
      }
      for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
        const key = keys[keyIndex];
        const value = xpubs[xpubIndex][key];
        const valueError = xpubFields[key](value, xpubIndex + 1);
        if (valueError !== "") return valueError;
      }
    }
    return "";
  }

  constructor(props) {
    super(props);
    this.state = {
      configError: "",
      configJson: "",
      refreshing: false,
      generating: false,
    };

    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
  }

  componentDidMount() {
    if (sessionStorage) {
      const configJson = sessionStorage.getItem(CARAVAN_CONFIG);
      if (configJson) this.setConfigJson(configJson);
    }
  }

  get previousButton() {
    const { wizardCurrentStep } = this.props;
    const currentStep = wizardCurrentStep;

    if (currentStep !== 0) {
      return (
        <Button
          id="btn-previous"
          type="button"
          variant="contained"
          color="primary"
          onClick={this.prev}
        >
          Back
        </Button>
      );
    }
    return null;
  }

  get nextButton() {
    const { wizardCurrentStep } = this.props;
    const currentStep = wizardCurrentStep;
    const buttonText =
      currentStep > 0 ? "Next" : "Manually Enter Wallet Details";

    if (currentStep < 6) {
      return (
        <Button
          id="btn-next"
          type="button"
          variant="contained"
          color="primary"
          onClick={this.next}
        >
          {buttonText}
        </Button>
      );
    }
    return null;
  }

  setConfigJson(configJson) {
    let configError;
    try {
      const config = JSON.parse(configJson);
      configError = CreateWallet.validateConfig(config);
    } catch (parseError) {
      configError = "Invalid JSON";
    }

    if (sessionStorage && configError === "") {
      sessionStorage.setItem(CARAVAN_CONFIG, configJson);
    }

    // async since importDetails needs the updated state for it to work
    this.setState({ configJson, configError }, () => {
      if (configError === "") this.importDetails();
    });
  }

  setGenerating(_val) {
    const { generating } = this.state;
    let val = _val;
    if (_val === undefined) val = !generating;
    this.setState({ generating: val });
  }

  handleImport = ({ target }) => {
    const fileReader = new FileReader();
    if (target.files[0] && target.files[0].size < 1048576) {
      fileReader.onload = (event) => {
        const configJson = event.target.result;
        this.setConfigJson(configJson);
      };
      fileReader.readAsText(target.files[0]);
    } else {
      this.setState({ configError: "Problem uploading file." });
    }
  };

  refresh = async () => {
    this.setState({ refreshing: true });
    await this.generatorRefresh();
    this.setState({ refreshing: false });
  };

  resetErrorAndClearTargetValue = (event) => {
    // eslint-disable-next-line no-param-reassign
    event.target.value = "";
    this.setState({ configError: "" });
  };

  importDetails = () => {
    const { configJson } = this.state;
    const {
      setTotalSigners,
      setRequiredSigners,
      setAddressType,
      setNetwork,
      setStartingAddressIndex,
      setExtendedPublicKeyImporterMethod,
      setExtendedPublicKeyImporterExtendedPublicKey,
      setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint,
      setExtendedPublicKeyImporterBIP32Path,
      setExtendedPublicKeyImporterFinalized,
      setExtendedPublicKeyImporterName,
      updateWalletNameAction,
      setClientType,
      setClientUrl,
      setClientUsername,
    } = this.props;

    const walletConfiguration = JSON.parse(configJson);
    setTotalSigners(walletConfiguration.quorum.totalSigners);
    setRequiredSigners(walletConfiguration.quorum.requiredSigners);
    setAddressType(walletConfiguration.addressType);
    if (walletConfiguration.network === "regtest") {
      setNetwork("testnet");
    } else {
      setNetwork(walletConfiguration.network);
    }
    updateWalletNameAction(0, walletConfiguration.name);
    // set client to unknown
    if (walletConfiguration.client) {
      setClientType(walletConfiguration.client.type);
      if (walletConfiguration.client.type === "private") {
        setClientUrl(walletConfiguration.client.url);
        setClientUsername(walletConfiguration.client.username);
      }
    } else {
      setClientType("unknown");
    }
    // optionally, set starting address index
    if (walletConfiguration.startingAddressIndex) {
      setStartingAddressIndex(walletConfiguration.startingAddressIndex);
    }
    walletConfiguration.extendedPublicKeys.forEach(
      (extendedPublicKey, index) => {
        const number = index + 1;
        setExtendedPublicKeyImporterName(number, extendedPublicKey.name);
        if (extendedPublicKey.method) {
          setExtendedPublicKeyImporterMethod(number, extendedPublicKey.method);
        } else {
          setExtendedPublicKeyImporterMethod(number, "unknown");
        }

        setExtendedPublicKeyImporterBIP32Path(
          number,
          extendedPublicKey.bip32Path
        );
        setExtendedPublicKeyImporterExtendedPublicKey(
          number,
          extendedPublicKey.xpub
        );
        if (extendedPublicKey.xfp) {
          setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint(
            number,
            extendedPublicKey.xfp
          );
        } else {
          setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint(
            number,
            "unknown"
          );
        }

        setExtendedPublicKeyImporterFinalized(number, true);
      }
    );
  };

  // add client picker if client === 'unknown'
  renderWalletImporter = () => {
    const { configError } = this.state;
    const { configuring } = this.props;

    if (configuring)
      return (
        <>
          <label htmlFor="upload-config">
            <input
              style={{ display: "none" }}
              id="upload-config"
              name="upload-config"
              accept="application/json"
              onChange={this.handleImport}
              onClick={this.resetErrorAndClearTargetValue}
              type="file"
            />

            <Button
              color="primary"
              variant="contained"
              component="span"
              style={{ marginTop: "20px" }}
            >
              Import Wallet Configuration
            </Button>
          </label>
          <FormHelperText error>{configError}</FormHelperText>
        </>
      );
    return "";
  };

  renderExtendedPublicKeyImporters = () => {
    const { totalSigners, configuring } = this.props;
    const extendedPublicKeyImporters = [];
    for (
      let extendedPublicKeyImporterNum = 1;
      extendedPublicKeyImporterNum <= totalSigners;
      extendedPublicKeyImporterNum += 1
    ) {
      extendedPublicKeyImporters.push(
        <Box
          key={extendedPublicKeyImporterNum}
          mt={extendedPublicKeyImporterNum === 1 ? 0 : 2}
          display={configuring ? "block" : "none"}
        >
          <ExtendedPublicKeyImporter
            key={extendedPublicKeyImporterNum}
            number={extendedPublicKeyImporterNum}
          />
        </Box>
      );
    }
    return extendedPublicKeyImporters;
  };

  downloadWalletDetails = (event) => {
    const { walletDetailsText } = this.props;
    event.preventDefault();
    const filename = this.walletDetailsFilename();
    downloadFile(walletDetailsText, filename);
  };

  walletDetailsFilename = () => {
    const {
      totalSigners,
      requiredSigners,
      addressType,
      walletName,
    } = this.props;
    return `bitcoin-${requiredSigners}-of-${totalSigners}-${addressType}-${walletName}.json`;
  };

  totalBalance = () => {
    const { deposits, change } = this.props;
    if (!Object.keys(deposits.nodes).length) return "";
    return satoshisToBitcoins(
      deposits.balanceSats.plus(change.balanceSats)
    ).toFixed();
  };

  clearConfig = (e) => {
    const { setExtendedPublicKeyImporterVisible, resetWallet } = this.props;
    e.preventDefault();
    resetWallet();
    setExtendedPublicKeyImporterVisible(true);
    this.setState({ generating: false });
  };

  next() {
    const { wizardCurrentStep, updateWizardCurrentStep } = this.props;
    let currentStep = wizardCurrentStep;
    currentStep = currentStep >= 5 ? 6 : currentStep + 1;
    updateWizardCurrentStep(currentStep);
  }

  prev() {
    const { wizardCurrentStep, updateWizardCurrentStep } = this.props;
    let currentStep = wizardCurrentStep;
    currentStep = currentStep <= 0 ? 1 : currentStep - 1;
    updateWizardCurrentStep(currentStep);
  }

  /**
   * Callback function to pass to the address importer
   * after addresses have been imported we want
   * @param {Array<string>} importedAddresses
   * @param {boolean} rescan - whether or not a rescan is being performed
   */

  async afterImportAddresses(importedAddresses, rescan) {
    // if rescan is true then there's no point in fetching
    // the slice data yet since we likely won't get anything
    // until the rescan is complete
    if (rescan) return;

    const { unknownSlices, fetchSliceData } = this.props;
    const importedSlices = unknownSlices.reduce((slices, slice) => {
      if (importedAddresses.indexOf(slice.multisig.address) > -1)
        slices.push(slice);
      return slice;
    }, []);

    await fetchSliceData(importedSlices);
  }

  render = () => {
    const {
      client,
      configuring,
      confirmedBalance,
      walletName,
      setName,
      deposits,
      change,
      network,
      pendingBalance,
      nodesLoaded,
      frozen,
      unknownAddresses,
      wizardCurrentStep,
    } = this.props;
    const { refreshing, generating } = this.state;
    const walletLoadError =
      change.fetchUTXOsErrors + deposits.fetchUTXOsErrors > 0
        ? "Wallet loaded, but with errors..."
        : "";

    return (
      <>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={10} md={6}>
              <WalletInfoCard
                editable={
                  !Object.keys(deposits.nodes).length ||
                  !Object.keys(change.nodes).length
                }
                walletName={walletName}
                setName={setName}
                balance={+satoshisToBitcoins(confirmedBalance).toFixed()}
                pendingBalance={+satoshisToBitcoins(pendingBalance).toFixed()}
                network={network}
              />
            </Grid>
            <Grid item xs={10} md={6}>
              {(nodesLoaded || frozen) && (
                <WalletActionsPanel
                  addresses={unknownAddresses}
                  refreshing={refreshing}
                  walletActivated={nodesLoaded}
                  handleRefresh={() => this.refresh()}
                  onClearConfig={(e) => {
                    this.clearConfig(e);
                  }}
                  onDownloadConfig={(e) => this.downloadWalletDetails(e)}
                  client={client}
                  onImportAddresses={(addresses, rescan) =>
                    this.afterImportAddresses(rescan)
                  }
                />
              )}
            </Grid>
          </Grid>
        </Box>
        {walletLoadError.length ? (
          <FormHelperText
            style={{ float: "right", padding: "11px", fontSize: "1.5em" }}
            error
          >
            {walletLoadError}
          </FormHelperText>
        ) : (
          ""
        )}

        <Box mt={2}>
          {!configuring ? null : (
            <div>
              <WizardIntro
                renderWalletImporter={this.renderWalletImporter}
                nextBtn={this.nextButton}
                prevBtn={this.previousButton}
              />
              <QuorumPicker
                nextBtn={this.nextButton}
                prevBtn={this.previousButton}
              />
              <AddressTypePicker
                nextBtn={this.nextButton}
                prevBtn={this.previousButton}
              />
              <ClientPicker
                nextBtn={this.nextButton}
                prevBtn={this.previousButton}
              />
              <NetworkPicker
                nextBtn={this.nextButton}
                prevBtn={this.previousButton}
              />
              <StartingAddressIndexPicker
                nextBtn={this.nextButton}
                prevBtn={this.previousButton}
              />
              {wizardCurrentStep < 6 ? null : (
                <Grid>
                  <Box mt={3}>{this.renderWalletImporter()}</Box>
                  <Box mt={3}>
                    <Grid item md={configuring ? 8 : 12}>
                      {this.renderExtendedPublicKeyImporters()}
                    </Grid>
                  </Box>
                </Grid>
              )}
            </div>
          )}
          <Box mt={2}>
            <WalletGenerator
              generating={generating}
              setGenerating={(value) => this.setGenerating(value)}
              downloadWalletDetails={this.downloadWalletDetails}
              // eslint-disable-next-line no-return-assign
              refreshNodes={(click) => (this.generatorRefresh = click)} // FIXME TIGHT COUPLING ALERT, this calls function downstream
            />
          </Box>
        </Box>
      </>
    );
  };
}

CreateWallet.propTypes = {
  addressType: PropTypes.string.isRequired,
  change: PropTypes.shape({
    balanceSats: PropTypes.shape({}),
    fetchUTXOsErrors: PropTypes.number,
    nodes: PropTypes.shape({}),
  }).isRequired,
  client: PropTypes.shape(clientPropTypes).isRequired,
  configuring: PropTypes.bool.isRequired,
  deposits: PropTypes.shape({
    balanceSats: PropTypes.shape({
      plus: PropTypes.func,
    }),
    fetchUTXOsErrors: PropTypes.number,
    nodes: PropTypes.shape({}),
  }).isRequired,
  confirmedBalance: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  frozen: PropTypes.bool.isRequired,
  fetchSliceData: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  nodesLoaded: PropTypes.bool.isRequired,
  pendingBalance: PropTypes.number,
  requiredSigners: PropTypes.number.isRequired,
  resetWallet: PropTypes.func.isRequired,
  setTotalSigners: PropTypes.func.isRequired,
  setRequiredSigners: PropTypes.func.isRequired,
  setAddressType: PropTypes.func.isRequired,
  setName: PropTypes.func.isRequired,
  setNetwork: PropTypes.func.isRequired,
  setStartingAddressIndex: PropTypes.func.isRequired,
  setExtendedPublicKeyImporterMethod: PropTypes.func.isRequired,
  setExtendedPublicKeyImporterExtendedPublicKey: PropTypes.func.isRequired,
  setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint:
    PropTypes.func.isRequired,
  setExtendedPublicKeyImporterBIP32Path: PropTypes.func.isRequired,
  setExtendedPublicKeyImporterFinalized: PropTypes.func.isRequired,
  setExtendedPublicKeyImporterName: PropTypes.func.isRequired,
  setExtendedPublicKeyImporterVisible: PropTypes.func.isRequired,
  setClientType: PropTypes.func.isRequired,
  setClientUrl: PropTypes.func.isRequired,
  setClientUsername: PropTypes.func.isRequired,
  totalSigners: PropTypes.number.isRequired,
  updateWalletNameAction: PropTypes.func.isRequired,
  updateWizardCurrentStep: PropTypes.func.isRequired,
  unknownAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
  unknownSlices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
  walletName: PropTypes.string.isRequired,
  walletDetailsText: PropTypes.string.isRequired,
  wizardCurrentStep: PropTypes.number.isRequired,
};

CreateWallet.defaultProps = {
  pendingBalance: 0,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...state.quorum,
    ...{
      walletName: state.wallet.common.walletName,
      nodesLoaded: state.wallet.common.nodesLoaded,
      walletMode: state.wallet.common.walletMode,
      wizardCurrentStep: state.wallet.common.wizardCurrentStep,
    },
    confirmedBalance: walletSelectors.getConfirmedBalance(state),
    pendingBalance: walletSelectors.getPendingBalance(state),
    walletDetailsText: getWalletDetailsText(state),
    unknownAddresses: getUnknownAddresses(state),
    unknownSlices: getUnknownAddressSlices(state),
    ...state.wallet,
    client: state.client,
  };
}

const mapDispatchToProps = {
  fetchSliceData: fetchSliceDataAction,
  resetWallet: resetWalletAction,
  setName: updateWalletNameActionImport,
  setTotalSigners: setTotalSignersAction,
  setRequiredSigners: setRequiredSignersAction,
  setAddressType: setAddressTypeAction,
  setNetwork: setNetworkAction,
  setStartingAddressIndex: setStartingAddressIndexAction,
  setExtendedPublicKeyImporterMethod: setExtendedPublicKeyImporterMethodAction,
  setExtendedPublicKeyImporterExtendedPublicKey: setExtendedPublicKeyImporterExtendedPublicKeyAction,
  setExtendedPublicKeyImporterBIP32Path: setExtendedPublicKeyImporterBIP32PathAction,
  setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint: setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprintAction,
  setExtendedPublicKeyImporterName: setExtendedPublicKeyImporterNameAction,
  setExtendedPublicKeyImporterFinalized: setExtendedPublicKeyImporterFinalizedAction,
  setExtendedPublicKeyImporterVisible: setExtendedPublicKeyImporterVisibleAction,
  updateWalletNameAction: updateWalletNameActionImport,
  updateWizardCurrentStep: updateWizardCurrentStepAction,
  ...wrappedActions({
    setClientType: SET_CLIENT_TYPE,
    setClientUrl: SET_CLIENT_URL,
    setClientUsername: SET_CLIENT_USERNAME,
    setClientPassword: SET_CLIENT_PASSWORD,
  }),
  updateDepositNode: updateDepositSliceAction,
  updateChangeNode: updateChangeSliceAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateWallet);
