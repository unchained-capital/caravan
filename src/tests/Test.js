import { diffChars, diffArrays, diffJSON } from "diff";

const SUCCESS = "success";
const FAILURE = "failure";
const ERROR = "error";

class Test {
  static SUCCESS = SUCCESS;

  static FAILURE = FAILURE;

  static ERROR = ERROR;

  static interaction() {
    throw Error("Define the `interaction` method in your subclass of `Test`.");
  }

  static supports() {
    return true;
  }

  static postprocess(thing) {
    return thing;
  }

  static matches(expected, actual) {
    return expected === actual;
  }

  static diff(expected, actual) {
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

  constructor(params) {
    this.params = params || {};
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
