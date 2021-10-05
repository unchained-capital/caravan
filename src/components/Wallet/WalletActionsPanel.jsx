import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  ButtonGroup,
  Grid,
  makeStyles,
  Tooltip,
  withStyles,
} from "@material-ui/core";
import MuiButton from "@material-ui/core/Button";

import CircularProgress from "@material-ui/core/CircularProgress";
import {
  RefreshOutlined,
  ExitToAppOutlined,
  GetAppOutlined,
} from "@material-ui/icons";

import { clientPropTypes } from "../../proptypes";
import { CARAVAN_CONFIG } from "./constants";

import ImportAddressesButton from "../ImportAddressesButton";
import { KeystoneWalletPlayer } from "../Keystone";
import SyncWalletDescription from "../Keystone/components/SyncWalletDescription";

const useStyles = makeStyles(() => ({
  card: {
    height: "100%",
    flexDirection: "column",
    display: "flex",
  },
  cardContent: {
    paddingTop: "0px",
    display: "flex",
    flex: 1,
  },
}));

const Button = withStyles({
  root: {
    "&.Mui-disabled": {
      pointerEvents: "auto",
    },
  },
})(MuiButton);

const ButtonWithTooltip = ({ tooltipText, disabled, onClick, ...other }) => {
  const adjustedButtonProps = {
    disabled,
    component: disabled ? "div" : undefined,
    onClick: disabled ? undefined : onClick,
  };
  return (
    <Tooltip title={tooltipText}>
      <Button {...other} {...adjustedButtonProps} />
    </Tooltip>
  );
};

ButtonWithTooltip.propTypes = {
  tooltipText: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const WalletActionsPanel = ({
  addresses,
  client,
  handleRefresh,
  onClearConfig,
  onDownloadConfig,
  onImportAddresses,
  refreshing,
  walletActivated,
  walletDetailsText,
  KeystoneWalletVerifyCode,
  shouldShowWalletDetailURs,
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
              <ButtonWithTooltip
                tooltipText="Force a refresh for latest wallet state and balance."
                disabled={!walletActivated}
                onClick={handleRefresh}
                startIcon={
                  refreshing ? (
                    <CircularProgress size={24} />
                  ) : (
                    <RefreshOutlined />
                  )
                }
              >
                Refresh
              </ButtonWithTooltip>
              <ButtonWithTooltip
                tooltipText="Download wallet configuration to local machine for backup. No security is lost with this, but access to this file provides anyone who has it information about balances."
                onClick={onDownloadConfig}
                disabled={false}
                startIcon={<GetAppOutlined />}
              >
                Download Configuration
              </ButtonWithTooltip>
              <ButtonWithTooltip
                tooltipText="Only clears the wallet config from browser sessions. Funds remain unaffected."
                disabled={!walletActivated}
                startIcon={<ExitToAppOutlined />}
                onClick={handleClearClick}
              >
                Clear Wallet
              </ButtonWithTooltip>
            </ButtonGroup>
          </Grid>
          {shouldShowWalletDetailURs && (
            <Grid item xs={12}>
              <ButtonGroup variant="outlined">
                <KeystoneWalletPlayer
                  buttonStyle={{
                    variant: "outlined",
                    color: "default",
                    withIcon: true,
                  }}
                  startText="Show Wallet for Keystone"
                  title="Scan the QR Code using Keystone"
                  renderDescription={() => {
                    return (
                      <SyncWalletDescription
                        verifyCode={KeystoneWalletVerifyCode}
                      />
                    );
                  }}
                  data={Buffer.from(walletDetailsText, "utf-8").toString("hex")}
                />
              </ButtonGroup>
            </Grid>
          )}
          {client.type === "private" && walletActivated && (
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
  walletDetailsText: PropTypes.string.isRequired,
  KeystoneWalletVerifyCode: PropTypes.string.isRequired,
  shouldShowWalletDetailURs: PropTypes.bool.isRequired,
};

WalletActionsPanel.defaultProps = {
  walletActivated: false,
  refreshing: false,
  addresses: [],
};

export default WalletActionsPanel;
