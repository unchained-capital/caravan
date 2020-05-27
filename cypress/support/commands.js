// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import { ERROR_CLASS } from "../constants";
import { initialCap, getAddressUrl } from "../helpers";

Cypress.Commands.add(
  "paste",
  {
    prevSubject: true,
  },
  (subject, text) => {
    cy.get(subject).invoke("val", text).type("t{backspace}");
  }
);

Cypress.Commands.add(
  "linkOpensInNewTab",
  {
    prevSubject: true,
  },
  (subject) => {
    cy.get(subject).should("have.attr", "target", "_blank");
  }
);

Cypress.Commands.add(
  "hasErrorMessage",
  {
    prevSubject: true,
  },
  (subject, message) => {
    cy.get(subject).should(($field) => {
      expect($field).to.contain(message);
      expect($field.find("div")).to.have.class(ERROR_CLASS);
    });
  }
);

Cypress.Commands.add(
  "equalsInputValue",
  {
    prevSubject: true,
  },
  (subject, expectedValue) => {
    cy.get(subject)
      .find("input")
      .invoke("val")
      .then((value) => {
        expect(value).to.equal(expectedValue);
      });
  }
);

Cypress.Commands.add(
  "matchesMultisigDetails",
  {
    prevSubject: true,
  },
  (subject, address, network, addressType, quorum, scripts) => {
    cy.get(subject).should(($multisigDetails) => {
      expect($multisigDetails).to.contain("BTC");
      expect($multisigDetails).to.contain(quorum);
      expect($multisigDetails).to.contain(address);
      expect($multisigDetails).to.contain(initialCap(network));
      expect($multisigDetails).to.contain(addressType);

      scripts.forEach((script) => {
        expect($multisigDetails).to.contain(script);
      });
    });

    cy.get(`a[href="${getAddressUrl(address, network)}"]`).linkOpensInNewTab();
  }
);
