import { diffChars, diffArrays, diffJSON } from "diff";

const SUCCESS = "success";
const FAILURE = "failure";
const ERROR = "error";

export class Test {
  static SUCCESS = SUCCESS;

  static FAILURE = FAILURE;

  static ERROR = ERROR;

  constructor(params) {
    this.params = params || {};
  }

  name() {
    return this.params.name;
  }

  description() {
    return this.params.description;
  }

  interaction() {
    throw Error("Define the `interaction` method in your subclass of `Test`.");
  }

  supports(version) {
    return true;
  }

  expected() {
    return this.params.expected;
  }

  async actual() {
    return await this.postprocess(this.interaction().run());
  }

  postprocess(thing) {
    return thing;
  }

  matches(expected, actual) {
    return expected === actual;
  }

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

  async run() {
    try {
      const actual = await this.actual();
      return this.resolve(actual);
    } catch (e) {
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
