import PropTypes from "prop-types";

// TODO: This should all be coming from typescript
// types in unchained-wallets/bitcoin

const ledgerPolicyHmacPropType = {
  xfp: PropTypes.string.isRequired,
  policyHmac: PropTypes.string.isRequired,
};

const extendedPublicKeyPropType = {
  bip32Path: PropTypes.string.isRequired,
  xfp: PropTypes.string.isRequired,
  xpub: PropTypes.string.isRequired,
};

const quorumPropType = {
  requiredSigners: PropTypes.number.isRequired,
  totalSigners: PropTypes.number,
};

const walletConfigPropType = {
  ledgerPolicyHmacs: PropTypes.arrayOf(
    PropTypes.shape(ledgerPolicyHmacPropType)
  ),
  addressType: PropTypes.string.isRequired,
  extendedPublicKeys: PropTypes.arrayOf(
    PropTypes.shape(extendedPublicKeyPropType)
  ),
  name: PropTypes.string,
  uuid: PropTypes.string,
  network: PropTypes.string.isRequired,
  quorum: PropTypes.shape(quorumPropType).isRequired,
};

export {
  walletConfigPropType,
  ledgerPolicyHmacPropType,
  extendedPublicKeyPropType,
  quorumPropType,
};
