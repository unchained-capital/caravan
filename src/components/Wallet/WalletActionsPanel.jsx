import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  CardContent,
  ButtonGroup,
  Grid,
  Tooltip,
} from "@mui/material";
import { makeStyles, withStyles } from "@mui/styles";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {
  RefreshOutlined,
  ExitToAppOutlined,
  GetAppOutlined,
} from "@mui/icons-material";

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
        <Grid container spacing={1} alignItems="center" justifyContent="center">
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
};

WalletActionsPanel.defaultProps = {
  walletActivated: false,
  refreshing: false,
  addresses: [],
};

export default WalletActionsPanel;
