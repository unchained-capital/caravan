import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "material-table";
import { Typography, Box } from "@material-ui/core";
import { satoshisToBitcoins } from "unchained-bitcoin";

import Copyable from "../Copyable";
import { slicePropTypes, clientPropTypes } from "../../proptypes";
import SliceDetails from "./SliceDetails";

const SlicesTable = ({
  slices,
  search,
  paging,
  title,
  client,
  network,
  disabled,
}) => {
  const options = {
    search,
    paging,
    detailPanelType: "single",
    showTitle: (title && title.length) || false,
  };
  options.toolbar = options.showTitle && options.search;
  let columns = [
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
      title: "Last Used",
      field: "lastUsed",
      render: (rowData) => <Typography>{rowData.lastUsed || ""}</Typography>,
    },
    {
      title: "Address",
      field: "address",
      render: (rowData) => (
        <Copyable text={rowData.multisig.address} showIcon showText code />
      ),
    },
  ];

  // filter out any columns that should be disabled
  columns = columns.filter((column) => !disabled.includes(column.field));
  return (
    <MaterialTable
      options={options}
      columns={columns}
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

SlicesTable.propTypes = {
  slices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
  search: PropTypes.bool,
  paging: PropTypes.bool,
  title: PropTypes.string,
  client: PropTypes.shape(clientPropTypes).isRequired,
  network: PropTypes.string.isRequired,
  disabled: PropTypes.arrayOf(PropTypes.string),
};

SlicesTable.defaultProps = {
  search: false,
  paging: false,
  title: "",
  disabled: [],
};

export default SlicesTable;
