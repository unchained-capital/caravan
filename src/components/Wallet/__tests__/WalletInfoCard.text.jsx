import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { render } from "../../../utils/test-utils";
import theme from "../../theme";

import WalletInfoCard from "../WalletInfoCard";

describe("WalletInfoCard", () => {
  const walletName = "Wallet Name";

  const renderWalletInfoCard = (passedProps) => {
    const { getByText, getByDataCy } = render(
      <ThemeProvider theme={theme}>
        <WalletInfoCard {...passedProps} />
      </ThemeProvider>
    );
    return { getByText, getByDataCy };
  };

  describe("editable", () => {
    test("allows editing the wallet name if editable", () => {
      const props = {
        walletName,
        editable: true,
        setName: () => {},
      };

      const { getByDataCy } = renderWalletInfoCard(props);
      expect(getByDataCy("edit-button")).toBeVisible();
    });
  });

  describe("not editable", () => {
    const props = {
      walletName,
      editable: false,
      setName: () => {},
    };

    test("renders with defaults", () => {
      const { getByText, getByDataCy } = renderWalletInfoCard(props);
      const walletInfoCard = getByDataCy("wallet-info-card");
      const balance = getByDataCy("balance");
      const pendingBalance = getByDataCy("pending-balance");
      const bitcoinIcon = getByDataCy("bitcoin-icon");

      expect(walletInfoCard).toBeVisible();
      expect(balance).toBeVisible();
      expect(balance).toHaveTextContent("0 BTC");
      expect(bitcoinIcon).toHaveAttribute("color", "grey");
      expect(getByText(walletName)).toBeVisible();
      expect(pendingBalance).toBeEmptyDOMElement();
    });

    test("shows a balance", () => {
      props.balance = 10;
      const { getByDataCy } = renderWalletInfoCard(props);

      const balance = getByDataCy("balance");
      expect(balance).toHaveTextContent("10 BTC");
    });

    test("shows a pending balance", () => {
      props.pendingBalance = 6.15;
      const { getByDataCy } = renderWalletInfoCard(props);

      const pendingBalance = getByDataCy("pending-balance");
      expect(pendingBalance).toHaveTextContent(
        `+${props.pendingBalance} BTC (unconfirmed)`
      );
    });
  });
});
