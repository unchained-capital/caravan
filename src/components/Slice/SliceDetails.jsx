/* eslint-disable react/no-array-index-key */
import React from "react";
import PropTypes from "prop-types";
import {
  Typography,
  Grid,
  Tabs,
  Button,
  Tab,
  Box,
  Paper,
  Tooltip,
  AppBar,
  makeStyles,
} from "@material-ui/core";

import UTXOSet from "../ScriptExplorer/UTXOSet";
import MultisigDetails from "../MultisigDetails";
import ImportAddressesButton from "../ImportAddressesButton";

import { slicePropTypes, clientPropTypes } from "../../proptypes";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));

function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`,
  };
}

const createTab = ({ tab }, index) => {
  const tooltipTab = (
    <Tab value={index.toString()} key={index} {...a11yProps(index)} {...tab} />
  );
  if (tab.disabled)
    return (
      <Tooltip title="Not available for this address" key={index} arrow>
        <div>{tooltipTab}</div>
      </Tooltip>
    );
  return tooltipTab;
};

function TabPanel({ children, value, index, ...other }) {
  return (
    <Grid
      container
      style={{ display: value === index ? "inherit" : "none" }}
      {...other}
    >
      <Grid item md={12}>
        <Box>{children}</Box>
      </Grid>
    </Grid>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.string.isRequired,
  index: PropTypes.string.isRequired,
};

TabPanel.defaultProps = {
  children: React.createElement("span"),
};

const SliceDetails = ({ slice, client }) => {
  const [tabIndex, setTabIndex] = React.useState("0");
  const classes = useStyles();

  const handleChange = (_e, newIndex) => setTabIndex(newIndex);
  const tabs = [
    {
      tab: {
        label: "Redeem Script",
      },
      panel: <MultisigDetails multisig={slice.multisig} showAddress={false} />,
    },
    {
      tab: {
        label: "Confirm on Device",
      },
      panel: "Confirm on Device",
    },
    {
      tab: {
        label: "UTXOs",
        disabled: !slice.balanceSats.isGreaterThan(0),
      },
      panel: (
        <UTXOSet inputs={slice.utxos} inputsTotalSats={slice.balanceSats} />
      ),
    },
    {
      tab: {
        label: "Watch Address",
        disabled: client.type !== "private",
      },
      panel: <ImportAddressesButton addresses={[slice.multisig.address]} />,
    },
  ];

  return (
    <Grid container className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleChange}
          aria-label="Slice Details View"
          centered
        >
          {tabs.map(createTab)}
        </Tabs>
      </AppBar>
      {tabs.map(({ panel }, index) => (
        <TabPanel value={tabIndex} index={index.toString()} key={index}>
          {panel}
        </TabPanel>
      ))}
    </Grid>
  );
};

SliceDetails.propTypes = {
  slice: PropTypes.shape(slicePropTypes).isRequired,
  client: PropTypes.shape(clientPropTypes).isRequired,
};

export default SliceDetails;
