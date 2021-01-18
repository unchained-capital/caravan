import React from "react";
import PropTypes from "prop-types";

const SyncWalletDescription = ({ verifyCode }) => {
  return (
    <div>
      <p>
        {`Touch the button "Import Multisig Wallet" on Cobo
                          Vault.`}
      </p>
      <p>
        Wallet Verification Code:{" "}
        <span style={{ color: "#77c0c3" }}>{verifyCode}.</span>
      </p>
      <p>
        When importing, please check whether the verification code is
        consistent, import after ensuring consistency.
      </p>
    </div>
  );
};

SyncWalletDescription.propTypes = {
  verifyCode: PropTypes.string.isRequired,
};

export default SyncWalletDescription;
