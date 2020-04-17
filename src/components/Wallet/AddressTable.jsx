import React from "react";
import PropTypes from "prop-types";
import MaterialTable from "material-table";
import { Typography } from "@material-ui/core";
import { satoshisToBitcoins } from "unchained-bitcoin";

import Copyable from "../Copyable";
import { slicePropTypes } from "../../proptypes";

const AddressTable = ({ slices, search, paging, title }) => {
  const options = {
    search,
    paging,
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
    />
  );
};

AddressTable.propTypes = {
  slices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes)).isRequired,
  search: PropTypes.bool,
  paging: PropTypes.bool,
  title: PropTypes.string,
};

AddressTable.defaultProps = {
  search: false,
  paging: false,
  title: "",
};

export default AddressTable;
