import React from "react";
import { Network } from "unchained-bitcoin";

import { render, screen } from "../../utils/test-utils";
import BitcoinIcon from "../BitcoinIcon";

describe("BitcoinIcon", () => {
  let bitcoinIcon;

  afterEach(() => {
    const bitcoinIconImage = screen.getByRole("img", { hidden: true });

    expect(bitcoinIcon).toContainElement(bitcoinIconImage);
    expect(bitcoinIconImage).toHaveAttribute("data-icon", "bitcoin");
    expect(bitcoinIconImage).toHaveClass("fa-bitcoin");
  });

  function renderIcon(network) {
    const { getByDataCy } = render(<BitcoinIcon network={network} />);
    return getByDataCy("bitcoin-icon");
  }

  test("shows an orange bitcoin icon if the network is mainnet", () => {
    bitcoinIcon = renderIcon(Network.MAINNET);
    expect(bitcoinIcon).toBeInTheDocument();
    expect(bitcoinIcon).toHaveAttribute("color", "orange");
  });

  test("shows a grey icon otherwise", () => {
    bitcoinIcon = renderIcon("testnet");
    expect(bitcoinIcon).toHaveAttribute("color", "grey");
  });
});
