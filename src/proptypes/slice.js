import PropTypes from "prop-types";

const slicePropTypes = {
  present: PropTypes.bool,
  bip32Path: PropTypes.string,
  publicKeys: PropTypes.array,
  multisig: PropTypes.shape({}),
  address: PropTypes.string.isRequired,
  balanceSats: PropTypes.shape({
    s: PropTypes.number,
    e: PropTypes.number,
    c: PropTypes.array,
  }),
  utxos: PropTypes.array,
  change: PropTypes.bool.isRequired,
  spend: PropTypes.bool.isRequired,
  fetchUtxos: PropTypes.bool,
  fetchUTXOsError: PropTypes.string.isRequired,
  addressUsed: PropTypes.bool,
  addressKnown: PropTypes.bool.isRequired,
  lastUsed: PropTypes.string,
};

export default slicePropTypes;
