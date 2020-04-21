import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { debounce } from "lodash";
import {
  deriveChildPublicKey,
  generateMultisigFromPublicKeys,
} from "unchained-bitcoin";
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  InputAdornment,
  Grid,
  TextField,
  FormHelperText,
  Typography,
  Box,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import {
  fetchAddressUTXOs,
  getAddressStatus,
  fetchFeeEstimate,
} from "../../blockchain";
import {
  getUnknownAddresses,
  getUnknownAddressSlices,
} from "../../selectors/wallet";

// Components
import ConfirmWallet from "./ConfirmWallet";
import WalletControl from "./WalletControl";
import WalletConfigInteractionButtons from "./WalletConfigInteractionButtons";
import ImportAddressesButton from "../ImportAddressesButton";

// Actions
import { setFrozen } from "../../actions/settingsActions";
import {
  updateDepositSliceAction,
  updateChangeSliceAction,
  resetNodesFetchErrors as resetNodesFetchErrorsAction,
  resetWallet as resetWalletAction,
} from "../../actions/walletActions";
import { fetchSliceData as fetchSliceDataAction } from "../../actions/braidActions";
import { setExtendedPublicKeyImporterVisible } from "../../actions/extendedPublicKeyImporterActions";
import { setIsWallet as setIsWalletAction } from "../../actions/transactionActions";
import { wrappedActions } from "../../actions/utils";
import {
  SET_CLIENT_PASSWORD,
  SET_CLIENT_PASSWORD_ERROR,
} from "../../actions/clientActions";
import { MAX_FETCH_UTXOS_ERRORS, MAX_TRAILING_EMPTY_NODES } from "./constants";

class WalletGenerator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      generating: false,
    };
  }

  componentDidMount() {
    const {
      setIsWallet,
      refreshNodes,
      common: { nodesLoaded },
    } = this.props;
    this.debouncedTestConnection = debounce(
      (args) => this.testConnection(args),
      500,
      { trailing: true, leading: false }
    );
    setIsWallet();
    refreshNodes(this.refreshNodes);
    if (nodesLoaded) this.setState({ generating: true });
  }

  async componentDidUpdate(prevProps) {
    const prevPassword = prevProps.client.password;
    const { setPasswordError, network, client } = this.props;
    // if the password was updated
    if (prevPassword !== client.password && client.password.length) {
      // test the connection using the set password
      // but only if the password field hasn't been changed for 500ms
      this.debouncedTestConnection({ network, client, setPasswordError });
    }
  }

  title = () => {
    const { totalSigners, requiredSigners, addressType } = this.props;
    return (
      <span className="justify-content-between d-flex">
        Your {requiredSigners}
        -of-
        {totalSigners} {addressType} Multisig Wallet
        <small className="text-muted">{` Extended Public Keys: ${this.extendedPublicKeyCount()}/${totalSigners}`}</small>
      </span>
    );
  };

  testConnection = async ({ network, client, setPasswordError }, cb) => {
    try {
      await fetchFeeEstimate(network, client);
      setPasswordError("");
      this.setState({ connectSuccess: true }, () => {
        // if testConnection was passed a callback
        // we call that after a successful test, which
        // in this case generates the wallet
        if (cb) setTimeout(cb, 750);
      });
    } catch (e) {
      this.setState({ connectSuccess: false });
      if (e.response && e.response.status === 401)
        setPasswordError(
          "Unauthorized: Incorrect username and password combination"
        );
      else setPasswordError(e.message);
    }
  };

  extendedPublicKeyCount = () => {
    const { extendedPublicKeyImporters } = this.props;
    return Object.values(extendedPublicKeyImporters).filter(
      (extendedPublicKeyImporter) => extendedPublicKeyImporter.finalized
    ).length;
  };

  toggleImporters = (event) => {
    event.preventDefault();
    const { setImportersVisible, configuring, resetWallet } = this.props;

    if (!configuring) {
      this.setState({ generating: false }, () => {
        resetWallet();
      });
    }
    setImportersVisible(!configuring);
  };

  generate = () => {
    const { setImportersVisible, freeze } = this.props;
    freeze(true);
    setImportersVisible(false);
    this.setState({ generating: true, connectSuccess: false }, () => {
      this.addNode(false, "m/0/0", true);
      this.addNode(true, "m/1/0", true);
    });
  };

  updateNode = (isChange, update) => {
    const { updateChangeSlice, updateDepositSlice } = this.props;
    const updater = isChange ? updateChangeSlice : updateDepositSlice;
    updater(update);
  };

  addNode = async (isChange, bip32Path, attemptToKeepGenerating) => {
    const multisigUpdates = await this.generateMultisig(
      isChange,
      bip32Path,
      attemptToKeepGenerating
    );
    this.updateNode(isChange, { bip32Path, ...multisigUpdates });
  };

  generateMultisig = async (isChange, bip32Path, attemptToKeepGenerating) => {
    const {
      extendedPublicKeyImporters,
      totalSigners,
      network,
      addressType,
      requiredSigners,
    } = this.props;
    const publicKeys = [];
    for (
      let extendedPublicKeyImporterNumber = 1;
      extendedPublicKeyImporterNumber <= totalSigners;
      extendedPublicKeyImporterNumber += 1
    ) {
      const extendedPublicKeyImporter =
        extendedPublicKeyImporters[extendedPublicKeyImporterNumber];
      const publicKey = deriveChildPublicKey(
        extendedPublicKeyImporter.extendedPublicKey,
        bip32Path,
        network
      );
      publicKeys.push(publicKey);
    }
    publicKeys.sort(); // BIP67

    const multisig = generateMultisigFromPublicKeys(
      network,
      addressType,
      requiredSigners,
      ...publicKeys
    );

    const utxoUpdates = await this.fetchUTXOs(
      isChange,
      multisig,
      attemptToKeepGenerating
    );
    return { multisig, ...utxoUpdates };
  };

  fetchUTXOs = async (isChange, multisig, attemptToKeepGenerating) => {
    const { network, client } = this.props;
    let addressStatus;
    let updates = await fetchAddressUTXOs(multisig.address, network, client);

    // only check for address status if there weren't any errors
    // fetching the utxos for the address
    if (updates && !updates.fetchUTXOsError.length)
      addressStatus = await getAddressStatus(multisig.address, network, client);

    if (addressStatus) {
      updates = { ...updates, addressUsed: addressStatus.used };
    }

    if (attemptToKeepGenerating) {
      setTimeout(() => this.generateNextNodeIfNecessary(isChange));
    }
    return updates;
  };

  generateNextNodeIfNecessary = (isChange) => {
    const { change, deposits } = this.props;
    const { trailingEmptyNodes } = isChange ? change : deposits;
    const { fetchUTXOsErrors } = isChange ? change : deposits;
    const allBIP32Paths = Object.keys((isChange ? change : deposits).nodes);
    if (
      trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES ||
      fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS
    ) {
      return;
    }

    allBIP32Paths.sort((p1, p2) => {
      const p1Segments = (p1 || "").split("/");
      const p2Segments = (p2 || "").split("/");
      const p1Index = parseInt(p1Segments[2], 10);
      const p2Index = parseInt(p2Segments[2], 10);
      return p1Index - p2Index;
    });
    const pathSegments = (allBIP32Paths[allBIP32Paths.length - 1] || "").split(
      "/"
    ); // m, 0, 1
    const maxIndex = parseInt(pathSegments[2], 10);
    const nextBIP32Path = `m/${pathSegments[1]}/${maxIndex + 1}`;
    // Similar to above, we wrap the call to add the next node with
    // setTimeout with a timeout of zero to allow React time to
    // render.
    setTimeout(() => this.addNode(isChange, nextBIP32Path, true));
  };

  refreshNodes = async () => {
    const { change, deposits, resetNodesFetchErrors } = this.props;
    const allNodes = Object.values(deposits.nodes).concat(
      Object.values(change.nodes)
    );
    const previousFetchErrors = Math.max(
      change.fetchUTXOsErrors,
      deposits.fetchUTXOsErrors
    );

    resetNodesFetchErrors();
    await Promise.all(
      allNodes.map(async (node) => {
        const utxos = await this.fetchUTXOs(node.change, node.multisig);
        this.updateNode(node.change, { bip32Path: node.bip32Path, ...utxos });
      })
    );

    if (previousFetchErrors >= MAX_FETCH_UTXOS_ERRORS) {
      const currentFetchErrors = Math.max(
        change.fetchUTXOsErrors,
        deposits.fetchUTXOsErrors
      );
      if (currentFetchErrors < 5) {
        // eslint-disable-next-line no-console
        console.log("we had errors but now looks good, try to build more");
      }
    }
  };

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

  async handlePasswordEnter(event) {
    event.preventDefault();
    this.debouncedTestConnection.cancel();
    await this.testConnection(this.props, this.generate);
  }

  async handlePasswordChange(event) {
    event.preventDefault();
    const { setPassword, setPasswordError } = this.props;
    const password = event.target.value;
    this.setState({ connectSuccess: false }, () => {
      setPassword(password);
      setPasswordError("");
    });
  }

  body() {
    const {
      totalSigners,
      configuring,
      downloadWalletDetails,
      client,
      unknownAddresses,
    } = this.props;
    const { generating, connectSuccess } = this.state;
    if (this.extendedPublicKeyCount() === totalSigners) {
      if (generating && !configuring) {
        return (
          <div>
            <WalletControl
              addNode={this.addNode}
              updateNode={this.updateNode}
            />
            <Box mt={2} textAlign="center">
              <Grid container>
                <Grid item>
                  <WalletConfigInteractionButtons
                    onClearFn={(e) => this.toggleImporters(e)}
                    onDownloadFn={downloadWalletDetails}
                  />
                </Grid>
                {client.type === "private" && (
                  <Grid item>
                    <ImportAddressesButton
                      addresses={unknownAddresses}
                      client={client}
                      importCallback={(addresses) =>
                        this.afterImportAddresses(addresses)
                      }
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          </div>
        );
      }
      return (
        <Card>
          <CardHeader title={this.title()} />
          <CardContent>
            <Button href="#" onClick={this.toggleImporters}>
              {configuring ? "Hide Key Selection" : "Edit Details"}
            </Button>
            <ConfirmWallet />
            <p>
              You have imported all&nbsp;
              {totalSigners} extended public keys. You will need to save this
              information.
            </p>
            <WalletConfigInteractionButtons
              onClearFn={(e) => this.toggleImporters(e)}
              onDownloadFn={downloadWalletDetails}
            />
            {client.type === "private" && (
              <Box my={5}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      This config uses a private client. Please enter password
                      if not set.
                    </Typography>
                  </Grid>
                  <Grid item>
                    <TextField
                      id="client-username"
                      label="Username"
                      defaultValue={client.username}
                      InputProps={{
                        readOnly: true,
                        disabled: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircleIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item md={4} xs={10}>
                    <form onSubmit={(event) => this.handlePasswordEnter(event)}>
                      <TextField
                        id="bitcoind-password"
                        fullWidth
                        type="password"
                        label="Password"
                        placeholder="Enter bitcoind password"
                        value={client.password}
                        onChange={(event) => this.handlePasswordChange(event)}
                        error={client.passwordError.length > 0}
                        helperText={client.passwordError}
                      />
                      {connectSuccess && (
                        <FormHelperText>
                          Connection confirmed with password!
                        </FormHelperText>
                      )}
                    </form>
                  </Grid>
                </Grid>
              </Box>
            )}
            <p>
              Please confirm that the above information is correct and you wish
              to generate your wallet.
            </p>
            <Button
              id="confirm-wallet"
              type="button"
              variant="contained"
              color="primary"
              onClick={this.generate}
              disabled={client.type === "private" && !connectSuccess}
            >
              Confirm
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <p>
        {`Once you have imported all ${totalSigners} extended public keys, `}
        {"your wallet will be generated here."}
      </p>
    );
  }

  render() {
    return <div>{this.body()}</div>;
  }
}

WalletGenerator.propTypes = {
  network: PropTypes.string.isRequired,
  addressType: PropTypes.string.isRequired,
  client: PropTypes.shape({
    password: PropTypes.string,
    passwordError: PropTypes.string,
    type: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  change: PropTypes.shape({
    nodes: PropTypes.shape({}),
    fetchUTXOsErrors: PropTypes.number,
  }).isRequired,
  deposits: PropTypes.shape({
    nodes: PropTypes.shape({}),
    fetchUTXOsErrors: PropTypes.number,
  }).isRequired,
  configuring: PropTypes.bool.isRequired,
  common: PropTypes.shape({
    nodesLoaded: PropTypes.bool,
  }).isRequired,
  downloadWalletDetails: PropTypes.func.isRequired,
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  fetchSliceData: PropTypes.func.isRequired,
  totalSigners: PropTypes.number.isRequired,
  requiredSigners: PropTypes.number.isRequired,
  freeze: PropTypes.func.isRequired,
  updateDepositSlice: PropTypes.func.isRequired,
  updateChangeSlice: PropTypes.func.isRequired,
  unknownAddresses: PropTypes.arrayOf(PropTypes.string),
  refreshNodes: PropTypes.func.isRequired,
  resetNodesFetchErrors: PropTypes.func.isRequired,
  resetWallet: PropTypes.func.isRequired,
  setImportersVisible: PropTypes.func.isRequired,
  setIsWallet: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  setPasswordError: PropTypes.func.isRequired,
  unknownSlices: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};

WalletGenerator.defaultProps = {
  unknownAddresses: [],
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...{ client: state.client },
    ...state.quorum,
    ...state.wallet,
    ...state.wallet.common,
    unknownAddresses: getUnknownAddresses(state),
    unknownSlices: getUnknownAddressSlices(state),
  };
}

const mapDispatchToProps = {
  freeze: setFrozen,
  updateDepositSlice: updateDepositSliceAction,
  updateChangeSlice: updateChangeSliceAction,
  fetchSliceData: fetchSliceDataAction,
  setImportersVisible: setExtendedPublicKeyImporterVisible,
  setIsWallet: setIsWalletAction,
  resetWallet: resetWalletAction,
  resetNodesFetchErrors: resetNodesFetchErrorsAction,
  ...wrappedActions({
    setPassword: SET_CLIENT_PASSWORD,
    setPasswordError: SET_CLIENT_PASSWORD_ERROR,
  }),
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletGenerator);
