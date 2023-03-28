import React, { useState } from "react";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { LEDGER, RegisterWalletPolicy } from "unchained-wallets";
import { getWalletConfig } from "../../selectors/wallet";
import { updateWalletPolicyRegistrationsAction } from "../../actions/walletActions";
import { setErrorNotification } from "../../actions/errorNotificationActions";

const RegisterLedgerButton = ({ ...otherProps }) => {
  const [isActive, setIsActive] = useState(false);
  const walletConfig = useSelector(getWalletConfig);
  const dispatch = useDispatch();

  const registerWallet = async () => {
    setIsActive(true);
    try {
      const interaction = new RegisterWalletPolicy({
        keystore: LEDGER,
        ...walletConfig,
      });
      const xfp = await interaction.getXfp();
      const policyHmac = await interaction.run();
      dispatch(updateWalletPolicyRegistrationsAction({ xfp, policyHmac }));
    } catch (e) {
      dispatch(setErrorNotification(e.message));
    } finally {
      setIsActive(false);
    }
  };
  return (
    <Button
      variant="outlined"
      onClick={registerWallet}
      disabled={isActive}
      {...otherProps}
    >
      Register w/ Ledger
    </Button>
  );
};

export default RegisterLedgerButton;
