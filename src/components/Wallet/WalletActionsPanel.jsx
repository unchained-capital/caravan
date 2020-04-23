import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  ButtonGroup,
  Grid,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  RefreshOutlined,
  ExitToAppOutlined,
  GetAppOutlined,
} from "@material-ui/icons";

import { clientPropTypes } from "../../proptypes";
import { CARAVAN_CONFIG } from "./constants";

import ImportAddressesButton from "../ImportAddressesButton";

const useStyles = makeStyles(() => ({
  card: {
    height: "100%",
    flexDirection: "column",
    display: "flex",
  },
  cardContent: {
    textAlign: "center",
    paddingTop: "0px",
    display: "flex",
    flex: 1,
  },
}));

const WalletActionsPanel = ({
  addresses,
  client,
  handleRefresh,
  onClearConfig,
  onDownloadConfig,
  onImportAddresses,
  refreshing,
  walletActivated,
}) => {
  const classes = useStyles();
  const handleClearClick = (e) => {
    e.preventDefault();
    if (sessionStorage) sessionStorage.removeItem(CARAVAN_CONFIG);
    onClearConfig(e);
  };
  return (
    <Card className={classes.card}>
      <CardHeader title="Wallet Actions" />
      <CardContent className={classes.cardContent}>
        <Grid container spacing={1} alignItems="center" justify="center">
          <Grid item xs={12}>
            <ButtonGroup variant="outlined">
              <Tooltip title="Force a refresh for latest wallet state and balance.">
                <Button
                  onClick={handleRefresh}
                  disabled={!walletActivated}
                  startIcon={
                    refreshing ? (
                      <CircularProgress size={24} />
                    ) : (
                      <RefreshOutlined />
                    )
                  }
                >
                  Refresh
                </Button>
              </Tooltip>
              <Tooltip title="Download wallet configuration to local machine for backup. No security is lost with this, but access to this file provides anyone who has it information about balances.">
                <Button
                  startIcon={<GetAppOutlined />}
                  onClick={onDownloadConfig}
                >
                  Download Configuration
                </Button>
              </Tooltip>
              <Tooltip title="Only clears the wallet config from browser sessions. Funds remain unaffected.">
                <Button
                  startIcon={<ExitToAppOutlined />}
                  onClick={handleClearClick}
                >
                  Clear Wallet
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Grid>
          {client.type === "private" && (
            <Grid item>
              <ImportAddressesButton
                addresses={addresses}
                client={client}
                importCallback={onImportAddresses}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

WalletActionsPanel.propTypes = {
  addresses: PropTypes.arrayOf(PropTypes.string),
  onImportAddresses: PropTypes.func.isRequired,
  walletActivated: PropTypes.bool,
  handleRefresh: PropTypes.func.isRequired,
  onClearConfig: PropTypes.func.isRequired,
  onDownloadConfig: PropTypes.func.isRequired,
  refreshing: PropTypes.bool,
  client: PropTypes.shape(clientPropTypes).isRequired,
};

WalletActionsPanel.defaultProps = {
  walletActivated: false,
  refreshing: false,
  addresses: [],
};

export default WalletActionsPanel;
