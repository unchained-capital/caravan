import {
  MAINNET,
  TESTNET,
  P2SH_LABEL,
  P2SH_P2WSH_LABEL,
  P2WSH_LABEL,
  BIP32_MAINNET_P2SH,
  INVALID_REDEEM_SCRIPT,
  ADDRESS_P2SH_MAINNET,
  ADDRESS_P2SH_TESTNET,
  ADDRESS_P2SH_P2WSH_MAINNET,
  ADDRESS_P2SH_P2WSH_TESTNET,
  ADDRESS_P2WSH_MAINNET,
  ADDRESS_P2WSH_TESTNET,
  P2SH_TESTNET_UTXO,
  P2SH_2OF3_SCRIPT_HEX,
  P2SH_2OF3_SCRIPT_OPS,
  P2SH_2OF3_REDEEM_SCRIPT_HEX,
  P2SH_2OF3_REDEEM_SCRIPT_OPS,
  P2SH_P2WSH_2OF3_SCRIPT_HEX,
  P2SH_P2WSH_2OF3_SCRIPT_OPS,
  P2SH_P2WSH_2OF3_REDEEM_SCRIPT_HEX,
  P2SH_P2WSH_2OF3_REDEEM_SCRIPT_OPS,
  P2SH_P2WSH_2OF3_WITNESS_SCRIPT_HEX,
  P2SH_P2WSH_2OF3_WITNESS_SCRIPT_OPS,
  P2WSH_2OF3_SCRIPT_HEX,
  P2WSH_2OF3_SCRIPT_OPS,
  P2WSH_2OF3_WITNESS_SCRIPT_HEX,
  P2WSH_2OF3_WITNESS_SCRIPT_OPS,
} from "../constants";

import { getTransactionUrl } from "../helpers";

describe("Script Page", () => {
  beforeEach(() => {
    cy.visit("/script");
    cy.get("[data-cy=script-card]").as("scriptCard");
    cy.get("[data-cy=script-entry-field]").as("scriptEntry");
    cy.get("[data-cy=script-entry-input]").as("scriptEntryInput");
  });

  describe("Errors shown on invalid input:", () => {
    it("invalid hex", () => {
      cy.get("@scriptEntry")
        .type("definitelyNotHex")
        .hasErrorMessage("Redeem script is not valid hex.");
    });

    it("containing whitespace", () => {
      cy.get("@scriptEntry")
        .type("contains white space")
        .hasErrorMessage(
          "Redeem script should not contain spaces, tabs, or newlines."
        );
      cy.get("@scriptEntryInput").clear();

      cy.get("@scriptEntry")
        .type("contains\twhite\tspace")
        .hasErrorMessage(
          "Redeem script should not contain spaces, tabs, or newlines."
        );
      cy.get("@scriptEntryInput").clear();
    });

    it("blank", () => {
      // TODO check for newlines tabs and spaces
      cy.get("@scriptEntry")
        .type("t{backspace}")
        .hasErrorMessage("Redeem script cannot be blank.");
    });

    it("invalid redeem script", () => {
      cy.get("@scriptEntryInput").paste(INVALID_REDEEM_SCRIPT);
      cy.get("@scriptEntry").hasErrorMessage("Failed to parse redeem script.");
    });
  });

  describe("Shows details for each address type:", () => {
    beforeEach(() => {
      cy.get("@scriptEntryInput").paste(P2SH_2OF3_REDEEM_SCRIPT_HEX);
      cy.get("[data-cy=multisig-details]").as("multisigDetails");
    });

    describe("P2SH", () => {
      const expectedScripts = [
        P2SH_2OF3_SCRIPT_HEX,
        P2SH_2OF3_SCRIPT_OPS,
        P2SH_2OF3_REDEEM_SCRIPT_HEX,
        P2SH_2OF3_REDEEM_SCRIPT_OPS,
      ];

      beforeEach(() => {
        cy.get(`#${P2SH_LABEL}`).click();
      });

      afterEach(() => {
        cy.get("@scriptCard").contains("Enter Redeem Script");
        cy.get("@scriptEntry").contains("Redeem Script");
        cy.get("@multisigDetails").should(($multisigDetails) => {
          expect($multisigDetails).to.contain(P2SH_LABEL);
        });
      });

      it("mainnet", () => {
        cy.get("@multisigDetails").matchesMultisigDetails(
          ADDRESS_P2SH_MAINNET,
          MAINNET,
          P2SH_LABEL,
          "2-of-3",
          expectedScripts
        );
      });

      it("testnet", () => {
        cy.get(`#${TESTNET}`).click();

        cy.get("@multisigDetails").matchesMultisigDetails(
          ADDRESS_P2SH_TESTNET,
          TESTNET,
          P2SH_LABEL,
          "2-of-3",
          expectedScripts
        );
      });
    });

    describe("P2SH-P2WSH", () => {
      const expectedScripts = [
        P2SH_P2WSH_2OF3_SCRIPT_HEX,
        P2SH_P2WSH_2OF3_SCRIPT_OPS,
        P2SH_P2WSH_2OF3_REDEEM_SCRIPT_HEX,
        P2SH_P2WSH_2OF3_REDEEM_SCRIPT_OPS,
        P2SH_P2WSH_2OF3_WITNESS_SCRIPT_HEX,
        P2SH_P2WSH_2OF3_WITNESS_SCRIPT_OPS,
      ];

      beforeEach(() => {
        cy.get(`#${P2SH_P2WSH_LABEL}`).click();
      });

      afterEach(() => {
        cy.get("@scriptCard").contains("Enter Witness Script");
        cy.get("@scriptEntry").contains("Witness Script");
        cy.get("@multisigDetails").should(($multisigDetails) => {
          expect($multisigDetails).to.contain(P2SH_P2WSH_LABEL);
        });
      });

      it("mainnet", () => {
        cy.get("@multisigDetails").matchesMultisigDetails(
          ADDRESS_P2SH_P2WSH_MAINNET,
          MAINNET,
          P2SH_P2WSH_LABEL,
          "2-of-3",
          expectedScripts
        );
      });

      it("testnet", () => {
        cy.get(`#${TESTNET}`).click();

        cy.get("@multisigDetails").matchesMultisigDetails(
          ADDRESS_P2SH_P2WSH_TESTNET,
          TESTNET,
          P2SH_P2WSH_LABEL,
          "2-of-3",
          expectedScripts
        );
      });
    });

    describe("P2WSH", () => {
      const expectedScripts = [
        P2WSH_2OF3_SCRIPT_HEX,
        P2WSH_2OF3_SCRIPT_OPS,
        P2WSH_2OF3_WITNESS_SCRIPT_HEX,
        P2WSH_2OF3_WITNESS_SCRIPT_OPS,
      ];

      beforeEach(() => {
        cy.get(`#${P2WSH_LABEL}`).click();
      });

      afterEach(() => {
        cy.get("@scriptCard").contains("Enter Witness Script");
        cy.get("@scriptEntry").contains("Witness Script");
        cy.get("@multisigDetails").should(($multisigDetails) => {
          expect($multisigDetails).to.contain(P2WSH_LABEL);
        });
      });

      it("mainnet", () => {
        cy.get("@multisigDetails").matchesMultisigDetails(
          ADDRESS_P2WSH_MAINNET,
          MAINNET,
          P2WSH_LABEL,
          "2-of-3",
          expectedScripts
        );
      });

      it("testnet", () => {
        cy.get(`#${TESTNET}`).click();

        cy.get("@multisigDetails").matchesMultisigDetails(
          ADDRESS_P2WSH_TESTNET,
          TESTNET,
          P2WSH_LABEL,
          "2-of-3",
          expectedScripts
        );
      });
    });
  });

  describe("Spending", () => {
    beforeEach(() => {
      cy.get("@scriptEntryInput").paste(P2SH_2OF3_REDEEM_SCRIPT_HEX);
    });

    it("Shows error if no UTXOs are available", () => {
      cy.get("[data-cy=spend-from-address-button]").click();
      cy.get("[data-cy=script-explorer]").contains("Failed to fetch UTXOs.");
    });

    describe("Shows additional cards if UTXOs are available:", () => {
      beforeEach(() => {
        cy.get(`#${TESTNET}`).click();
        cy.get("[data-cy=spend-from-address-button]").click();
      });

      it("available inputs", () => {
        cy.get("[data-cy=utxo-card]").contains(P2SH_TESTNET_UTXO);
        cy.get(`a[href="${getTransactionUrl(P2SH_TESTNET_UTXO, TESTNET)}"]`);
      });

      describe("define outputs:", () => {
        describe("enter address and amount", () => {});

        describe("add additional outputs", () => {});

        describe("fee", () => {});

        describe("invalid values:", () => {
          describe("address", () => {
            it("invalid prefix", () => {
              cy.get("[data-cy=output-address-field]")
                .type("hgsdfhgsdfh")
                .hasErrorMessage(
                  "Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits."
                );
            });

            it("wrong network", () => {
              cy.get("[data-cy=output-address-field]")
                .type(ADDRESS_P2SH_MAINNET)
                .hasErrorMessage(
                  "Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits."
                );
            });

            it("invalid address", () => {
              cy.get("[data-cy=output-address-field]")
                .type(`${ADDRESS_P2SH_TESTNET}{backspace}t`)
                .hasErrorMessage("Address is invalid.");
            });

            it("blank", () => {
              cy.get("[data-cy=output-address-field]")
                .type("t{backspace}")
                .hasErrorMessage("Address cannot be blank.");
            });

            it("too short", () => {
              cy.get("[data-cy=output-address-field]")
                .type(`${ADDRESS_P2SH_TESTNET}{backspace}t`)
                .hasErrorMessage("Address is invalid.");
            });

            it("too long", () => {
              cy.get("[data-cy=output-address-field]")
                .type(
                  "2N4mP8tum43NDZLSYY1v1nKhFhPGi2tVi6P22N4mP8tum43NDZLSYY1v1nKhFhPGi2tVi6P2N4mP8tum43NDZLSYY1v1nKhFhPGi2tVi6P"
                )
                .hasErrorMessage("Address is invalid.");
            });
          });

          describe("amount:", () => {
            beforeEach(() => {
              cy.get("[data-cy=output-amount-field").find("input").clear();
            });

            it("non-numeric", () => {
              cy.get("[data-cy=output-amount-field")
                .type("hgbsdfghsdfh")
                .hasErrorMessage("Invalid output amount.");
            });

            it("negative", () => {
              cy.get("[data-cy=output-amount-field")
                .type("-100")
                .hasErrorMessage("Output amount must be positive.");
            });

            it("an obscene amount", () => {
              cy.get("[data-cy=output-amount-field")
                .type("10000")
                .hasErrorMessage("Output amount is too large");
            });

            it("more than total balance", () => {
              cy.get("[data-cy=inputs-total-field")
                .find("input")
                .invoke("val")
                .then((value) => {
                  cy.get("[data-cy=output-amount-field").type(value);

                  cy.get("[data-cy=outputs-total]").hasErrorMessage(
                    "Decrease by 0.00000357."
                  );
                });
            });
          });
        });

        it("reset outputs", () => {
          cy.get("input[name=destination]").paste(
            "tb1q9dqt5098avyv98rnxzuj42d5kj9v347qzvnstykkjskqaggeyptqa5azzf"
          );
          cy.get("[data-cy=reset-outputs-button]").click();
        });
        describe("gather signatures", () => {});
      });
    });
  });

  describe("Confirmation of address ownership:", () => {
    beforeEach(() => {
      cy.get("@scriptEntryInput").paste(P2SH_2OF3_REDEEM_SCRIPT_HEX);
      cy.get("[data-cy=multisig-details]").as("multisigDetails");
      cy.get("[data-cy=confirm-ownership-button]").click();
      cy.get("[data-cy=key-method-select]").click();
    });

    it("trezor", () => {
      cy.get("[data-cy=method-trezor]").click();
      cy.get("[data-cy=bip32-path-input]").type("{backspace}1");
      cy.get("[data-cy=bip32-default-button]").click();
      cy.get("[data-cy=import-public-key-button]").click();
      cy.get("[data-cy=bip32-path-input]").equalsInputValue(BIP32_MAINNET_P2SH);
    });

    it("ledger", () => {
      cy.get("[data-cy=method-ledger]").click();
      cy.get("[data-cy=bip32-path-input]").type("{backspace}1");
      cy.get("[data-cy=bip32-default-button]").click();
      cy.get("[data-cy=import-public-key-button]").click();
      cy.get("[data-cy=bip32-path-input]").equalsInputValue(BIP32_MAINNET_P2SH);
    });

    it("hermit", () => {
      cy.get("[data-cy=method-hermit]").click();
      cy.get("[data-cy=hermit-start-button]").click();
    });
  });
});
