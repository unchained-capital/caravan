const types = [
  ` feat:     A new feature`,
  ` fix:      A bug fix (or dependency update)`,
  ` build:    Changes that affect the build system or external dependencies`,
  ` docs:     Documentation only changes`,
  ` style:    Changes that do not affect the meaning of the code
             (white-space, formatting, missing semi-colons, etc)`,
  ` refactor: A code change that neither fixes a bug nor adds a feature`,
  ` perf:     A code change that improves performance`,
  ` test:     Adding missing tests`,
  ` revert:   Revert to a commit`,
  ` WIP:      Work in progress`
];

const messages = {
  type: `Select the type of change that you're committing:`,

  subject: `Write a SHORT, IMPERATIVE tense description of the change:\n`,

  body: `Provide a LONGER description of the change (optional). Use "|" to break new line:\n`,

  breaking: `Describe any BREAKING CHANGES (optional):\n`,

  footer: ` List any RELATED ISSUES to this change (optional).\n`,

  confirmCommit: `Are you sure you want to proceed with the commit above?`
};

const scopes = [
  "address",
  "clientpicker",
  "hermit",
  "pubkeyimporter",
  "slices",
  "scriptexplorer",
  "testrunner",
  "wallet",
  "xpubimporter",
  "dependencies",
  "other",
];

module.exports = {
  types: types.map((type) => ({
    value: type.split(":")[0].trim(),
    name: type
  })),

  scopes: scopes.map((scope) => ({
    name: scope
  })),

  messages,

  subjectLimit: 65,
  allowCustomScopes: false,
  allowTicketNumber: false,
  allowBreakingChanges: ["feat", "fix"],
  breakingPrefix: "BREAKING CHANGE:",
  footerPrefix: "ISSUES:"
};
