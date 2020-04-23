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
  DeleteOutlined,
  GetAppOutlined,
} from "@material-ui/icons";

import { clientPropTypes } from "../../proptypes";
import { CARAVAN_CONFIG } from "./constants";

import ImportAddressesButton from "../ImportAddressesButton";

const useStyles = makeStyles(() => ({
  card: {
    height: "100%",
  },
  cardContent: {
    textAlign: "center",
    paddingTop: "0px",
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
        <Grid container direction="column" spacing={1}>
          <Grid item>
            <ButtonGroup variant="outlined">
              <Button
                onClick={handleRefresh}
                disabled={!walletActivated}
                endIcon={
                  refreshing ? (
                    <CircularProgress size={24} />
                  ) : (
                    <RefreshOutlined />
                  )
                }
              >
                Refresh
              </Button>
              <Button endIcon={<GetAppOutlined />} onClick={onDownloadConfig}>
                Download Configuration
              </Button>
              <Tooltip title="Only clears the wallet config from browser sessions. Funds remain unaffected.">
                <Button
                  color="secondary"
                  endIcon={<DeleteOutlined />}
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
