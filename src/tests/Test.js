import { diffChars, diffArrays, diffJSON } from "diff";

const SUCCESS = "success";
const FAILURE = "failure";
const ERROR = "error";

class Test {
  static SUCCESS = SUCCESS;

  static FAILURE = FAILURE;

  static ERROR = ERROR;

  // eslint-disable-next-line class-methods-use-this
  postprocess(thing) {
    return thing;
  }

  // eslint-disable-next-line class-methods-use-this
  interaction() {
    throw Error("Define the `interaction` method in your subclass of `Test`.");
  }

  // eslint-disable-next-line class-methods-use-this
  matches(expected, actual) {
    return expected === actual;
  }

  constructor(params) {
    this.params = params || {};
  }

  // eslint-disable-next-line class-methods-use-this
  diff(expected, actual) {
    if (typeof expected === "string" && typeof actual === "string") {
      return diffChars(expected, actual);
    }
    if (typeof expected === "object" && typeof actual === "object") {
      if (expected.length !== undefined && actual.length !== undefined) {
        return diffArrays(expected, actual);
      }
      if (expected.length === undefined && actual.length === undefined) {
        return diffJSON(expected, actual);
      }
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  supports() {
    return true;
  }

  name() {
    return this.params.name;
  }

  description() {
    return this.params.description;
  }

  expected() {
    return this.params.expected;
  }

  async actual() {
    return this.postprocess(this.interaction().run());
  }

  async run() {
    try {
      const actual = await this.actual();
      return this.resolve(actual);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return { status: ERROR, message: e.message };
    }
  }

  resolve(actual) {
    const expected = this.expected();
    if (this.matches(expected, actual)) {
      return { status: SUCCESS };
    }
    return {
      status: FAILURE,
      expected,
      actual,
      diff: this.diff(expected, actual),
    };
  }
}

export default Test;
