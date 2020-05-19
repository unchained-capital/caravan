describe("Help Page", () => {
  beforeEach(() => {
    cy.visit("/help");
  });

  it("Has a link to setup wallet", () => {
    cy.get("[data-cy=setup-wallet-button]").click();
    cy.url().should("include", "/wallet");
  });

  it("Has a link to setup address", () => {
    cy.get("[data-cy=setup-address-button]").click();
    cy.url().should("include", "/address");
  });

  it("Has links to Learn More resources", () => {
    cy.get(
      'a[href="https://unchained-capital.com/blog/gearing-up-the-caravan/"]'
    ).should("have.attr", "target", "_blank");
    cy.get(
      'a[href="https://www.youtube.com/playlist?list=PLUM8mrUjWoPRsVGEZ1gTntqPd4xrQZoiH"]'
    ).should("have.attr", "target", "_blank");
    cy.get('a[href="https://github.com/unchained-capital/caravan"]').should(
      "have.attr",
      "target",
      "_blank"
    );
  });

  it("Has links to supported devices and browsers", () => {
    cy.get('a[href="https://shop.trezor.io/product/trezor-one-white"]').should(
      "have.attr",
      "target",
      "_blank"
    );
    cy.get('a[href="https://shop.trezor.io/product/trezor-model-t"]').should(
      "have.attr",
      "target",
      "_blank"
    );
    cy.get('a[href="https://www.ledger.com/products/ledger-nano-s"]').should(
      "have.attr",
      "target",
      "_blank"
    );
    cy.get('a[href="https://www.ledger.com/products/ledger-nano-x"]').should(
      "have.attr",
      "target",
      "_blank"
    );

    cy.get('a[href="https://www.google.com/chrome/"]').should(
      "have.attr",
      "target",
      "_blank"
    );
    cy.get('a[href="https://www.mozilla.org/en-US/firefox/new/"]').should(
      "have.attr",
      "target",
      "_blank"
    );
  });

  it("Has a link to report an issue and run tests", () => {
    cy.get('a[href="https://github.com/unchained-capital/caravan/issues"]');

    cy.get("[data-cy=run-tests-button]").click();
    cy.url().should("include", "/test");
  });
});
