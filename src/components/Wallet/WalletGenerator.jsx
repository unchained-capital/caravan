import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { debounce } from "lodash";
import {
  deriveMultisigByPath,
  ExtendedPublicKey,
  generateBraid,
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
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  fetchAddressUTXOs,
  getAddressStatus,
  fetchFeeEstimate,
} from "../../blockchain";
import ClientPicker from "../ClientPicker";
import ConfirmWallet from "./ConfirmWallet";
import RegisterWallet from "./RegisterWallet";
import WalletControl from "./WalletControl";
import WalletConfigInteractionButtons from "./WalletConfigInteractionButtons";
import { setFrozen } from "../../actions/settingsActions";
import {
  updateDepositSliceAction,
  updateChangeSliceAction,
  resetNodesFetchErrors as resetNodesFetchErrorsAction,
  resetWallet as resetWalletAction,
  initialLoadComplete as initialLoadCompleteAction,
  updateWalletPolicyRegistrationsAction,
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
      connectSuccess: false,
      unknownClient: false,
    };
  }

  componentDidMount() {
    const {
      refreshNodes,
      common: { nodesLoaded },
      setGenerating,
    } = this.props;
    this.debouncedTestConnection = debounce(
      (args) => this.testConnection(args),
      500,
      { trailing: true, leading: false }
    );
    refreshNodes(this.refreshNodes);
    if (nodesLoaded) setGenerating(true);
  }

  async componentDidUpdate(prevProps) {
    const prevPassword = prevProps.client.password;
    const {
      setPasswordError,
      network,
      client,
      common: { nodesLoaded },
      setIsWallet,
      configuring,
    } = this.props;
    const { unknownClient } = this.state;
    if (client.type === "unknown" && prevProps.client.type === "public") {
      this.setState({ unknownClient: true });
    } else if (configuring && client.type !== "unknown" && unknownClient) {
      // re-initializes the state if we're in the configuring stage.
      // catches situation where wallet is cleared and new one is added
      this.setState({ unknownClient: false });
    }
    // if the password was updated
    if (prevPassword !== client.password && client.password.length) {
      // test the connection using the set password
      // but only if the password field hasn't been changed for 500ms
      this.debouncedTestConnection({ network, client, setPasswordError });
    }

    // make sure the spend view knows it's a wallet view once nodes
    // are loaded
    if (!prevProps.common.nodesLoaded && nodesLoaded) setIsWallet();
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
      network,
      addressType,
      requiredSigners,
    } = this.props;

    const extendedPublicKeys = this.generateRichExtendedPublicKeys(
      extendedPublicKeyImporters
    );
    const index = isChange ? "1" : "0";
    const braid = generateBraid(
      network,
      addressType,
      extendedPublicKeys,
      requiredSigners,
      index
    );
    const multisig = deriveMultisigByPath(braid, bip32Path);

    // FIXME: Add regtest option for private node, if you're on regtest have to change the prefix for p2wsh addresses.
    // if (true) {
    //   const multisigAddress = bitcoin.address.fromBech32(multisig.address);
    //   multisig.address = bitcoin.address.toBech32(multisigAddress.data, multisigAddress.version, 'bcrt');
    // }
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
    const { change, deposits, initialLoadComplete } = this.props;
    const { trailingEmptyNodes } = isChange ? change : deposits;
    const { fetchUTXOsErrors } = isChange ? change : deposits;
    const allBIP32Paths = Object.keys((isChange ? change : deposits).nodes);
    if (
      trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES ||
      fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS
    ) {
      initialLoadComplete();
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

  generate = () => {
    const { setImportersVisible, freeze, setGenerating, startingAddressIndex } =
      this.props;
    const startingDepositBIP32Suffix = `m/0/${startingAddressIndex}`;
    const startingChangeBIP32Suffix = `m/1/${startingAddressIndex}`;
    freeze(true);
    setImportersVisible(false);
    setGenerating(true);
    this.setState({ connectSuccess: false }, () => {
      this.addNode(false, startingDepositBIP32Suffix, true);
      this.addNode(true, startingChangeBIP32Suffix, true);
    });
  };

  toggleImporters = (event, clear) => {
    event.preventDefault();
    const {
      setImportersVisible,
      configuring,
      resetWallet,
      initialLoadComplete,
      setGenerating,
    } = this.props;

    if (!configuring) {
      setGenerating(false);
      if (clear) resetWallet();
      if (!clear) initialLoadComplete();
    }

    setImportersVisible(!configuring);
  };

  extendedPublicKeyCount = () => {
    const { extendedPublicKeyImporters } = this.props;
    return Object.values(extendedPublicKeyImporters).filter(
      (extendedPublicKeyImporter) => extendedPublicKeyImporter.finalized
    ).length;
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

  // eslint-disable-next-line class-methods-use-this
  generateRichExtendedPublicKeys(extendedPublicKeyImporters) {
    return Object.values(extendedPublicKeyImporters).map((importer) => {
      const extendedPublicKey = ExtendedPublicKey.fromBase58(
        importer.extendedPublicKey
      );
      extendedPublicKey.setRootFingerprint(
        importer.rootXfp && !importer.rootXfp.toLowerCase().includes("unknown")
          ? importer.rootXfp
          : "00000000"
      );
      extendedPublicKey.setBip32Path(
        importer.bip32Path &&
          !importer.bip32Path.toLowerCase().includes("unknown")
          ? importer.bip32Path
          : `m${"/0".repeat(extendedPublicKey.depth)}`
      );
      extendedPublicKey.addBase58String();
      return extendedPublicKey;
    });
  }

  body() {
    const {
      totalSigners,
      configuring,
      downloadWalletDetails,
      client,
      generating,
      extendedPublicKeyImporters,
    } = this.props;
    const { connectSuccess, unknownClient } = this.state;
    const hasConflict = Object.values(extendedPublicKeyImporters).some(
      (xpub) => xpub.conflict
    );
    if (this.extendedPublicKeyCount() === totalSigners) {
      if (generating && !configuring) {
        return (
          <WalletControl addNode={this.addNode} updateNode={this.updateNode} />
        );
      }
      if (!hasConflict) {
        return (
          <Card>
            <CardHeader title={this.title()} />
            <CardContent>
              <Button href="#" onClick={(e) => this.toggleImporters(e, false)}>
                {configuring ? "Hide Key Selection" : "Edit Details"}
              </Button>
              <ConfirmWallet />
              <Grid container>
                <Grid item>
                  <RegisterWallet />
                </Grid>
              </Grid>
              <p>
                You have imported all&nbsp;
                {totalSigners} extended public keys. You will need to save this
                information.
              </p>
              <WalletConfigInteractionButtons
                onClearFn={(e) => this.toggleImporters(e, true)}
                onDownloadFn={downloadWalletDetails}
              />
              {unknownClient && (
                <Box my={5}>
                  <Typography variant="subtitle1">
                    This config does not contain client information. Please
                    choose a client to connect to before importing your wallet.
                  </Typography>
                  <ClientPicker
                    onSuccess={() => this.setState({ connectSuccess: true })}
                  />
                </Box>
              )}
              {client.type === "private" && !unknownClient && (
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
                      <form
                        onSubmit={(event) => this.handlePasswordEnter(event)}
                      >
                        <TextField
                          id="bitcoind-password"
                          fullWidth
                          type="password"
                          label="Password"
                          placeholder="Enter bitcoind password"
                          value={client.password}
                          variant="standard"
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
                Please confirm that the above information is correct and you
                wish to generate your wallet.
              </p>
              <Button
                id="confirm-wallet"
                type="button"
                variant="contained"
                color="primary"
                onClick={this.generate}
                disabled={client.type !== "public" && !connectSuccess}
              >
                Confirm
              </Button>
            </CardContent>
          </Card>
        );
      }
      return (
        <p>You must correct the conflict before the wallet can be generated.</p>
      );
    }
    return (
      <p>
        {`Once you have imported all ${totalSigners} extended public keys, `}
        {"your wallet will be generated here."}
        {hasConflict &&
          ` You will not be able to continue until you address the conflict.`}
      </p>
    );
  }

  render() {
    return <div>{this.body()}</div>;
  }
}

WalletGenerator.propTypes = {
  addressType: PropTypes.string.isRequired,
  change: PropTypes.shape({
    nodes: PropTypes.shape({}),
    fetchUTXOsErrors: PropTypes.number,
  }).isRequired,
  client: PropTypes.shape({
    password: PropTypes.string,
    passwordError: PropTypes.string,
    type: PropTypes.string,
    username: PropTypes.string,
  }).isRequired,
  common: PropTypes.shape({
    nodesLoaded: PropTypes.bool,
  }).isRequired,
  configuring: PropTypes.bool.isRequired,
  deposits: PropTypes.shape({
    nodes: PropTypes.shape({}),
    fetchUTXOsErrors: PropTypes.number,
  }).isRequired,
  downloadWalletDetails: PropTypes.func.isRequired,
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  freeze: PropTypes.func.isRequired,
  generating: PropTypes.bool.isRequired,
  initialLoadComplete: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  setGenerating: PropTypes.func.isRequired,
  startingAddressIndex: PropTypes.number.isRequired,
  refreshNodes: PropTypes.func.isRequired,
  requiredSigners: PropTypes.number.isRequired,
  resetNodesFetchErrors: PropTypes.func.isRequired,
  resetWallet: PropTypes.func.isRequired,
  setImportersVisible: PropTypes.func.isRequired,
  setIsWallet: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  setPasswordError: PropTypes.func.isRequired,
  totalSigners: PropTypes.number.isRequired,
  updateChangeSlice: PropTypes.func.isRequired,
  updateDepositSlice: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...{ client: state.client },
    ...state.quorum,
    ...state.wallet,
    ...state.wallet.common,
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
  initialLoadComplete: initialLoadCompleteAction,
  updateWalletPolicyRegistrations: updateWalletPolicyRegistrationsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletGenerator);
