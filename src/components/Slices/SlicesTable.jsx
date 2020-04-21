import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "material-table";
import { Typography, Box } from "@material-ui/core";
import { satoshisToBitcoins } from "unchained-bitcoin";

import Copyable from "../Copyable";
import { slicePropTypes, clientPropTypes } from "../../proptypes";
import SliceDetails from "./SliceDetails";

const AddressTable = ({ slices, search, paging, title, client, network }) => {
  const options = {
    search,
    paging,
    detailPanelType: "single",
    showTitle: (title && title.length) || false,
  };
  options.toolbar = options.showTitle && options.search;

  return (
    <MaterialTable
      options={options}
      columns={[
        { title: "BIP32 Path", field: "bip32Path", type: "string" },
        {
          title: "UTXOs",
          field: "utxos",
          width: "50px",
          render: (rowData) => <Typography>{rowData.utxos.length}</Typography>,
        },
        {
          title: "Balance",
          field: "balanceSats",
          render: (rowData) => (
            <Typography>
              {satoshisToBitcoins(rowData.balanceSats).toString()}
            </Typography>
          ),
        },
        {
          title: "Address",
          field: "address",
          render: (rowData) => (
            <Copyable text={rowData.multisig.address} showIcon showText code />
          ),
        },
      ]}
      data={slices}
      detailPanel={[
        {
          tooltip: "Address Details",
          render: (rowData) => (
            <Box p={1}>
              <SliceDetails client={client} slice={rowData} network={network} />
            </Box>
          ),
        },
      ]}
    />
  );
};

AddressTable.propTypes = {
  slices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
  search: PropTypes.bool,
  paging: PropTypes.bool,
  title: PropTypes.string,
  client: PropTypes.shape(clientPropTypes).isRequired,
  network: PropTypes.string.isRequired,
};

AddressTable.defaultProps = {
  search: false,
  paging: false,
  title: "",
};

export default AddressTable;
