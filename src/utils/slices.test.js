import assert from "assert";
import * as sliceUtils from "./slices";
import {
  DEFAULT_PREFIX,
  DEFAULT_CHANGE_PREFIX,
  CHANGE_INDEX,
} from "./constants";

describe("slices utils", () => {
  describe("compareSlicesByTime", () => {
    let a;
    let b;
    let c;
    const desc = "desc";
    beforeEach(() => {
      a = {
        bip32Path: "m/0/5",
        lastUsed: "04/20/2020",
        lastUsedTime: 1587458800000,
        utxos: [
          {
            time: 1587358800000,
          },
          {
            time: 1587458800000,
          },
        ],
      };
      b = {
        bip32Path: "m/0/6",
        lastUsed: "04/23/2020",
        lastUsedTime: 1587758800000,
        utxos: [
          {
            time: 1587458800000,
          },
          {
            time: 1587758800000,
          },
        ],
      };
      c = {
        bip32Path: "m/0/7",
        lastUsed: "Spent",
        utxos: [],
      };
    });
    it("should correctly compare slices by lastUsed:", () => {
      // a is before b
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(1);
      expect(sliceUtils.compareSlicesByTime(a, b, desc)).toEqual(-1);

      // b is before a
      a.lastUsed = "04/23/2020";
      a.lastUsedTime = 1587758800000;
      b.lastUsed = "04/20/2020";
      b.lastUsedTime = 1587458800000;
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(-1);

      // a and b are at the same time
      b.lastUsed = a.lastUsed;
      b.lastUsedTime = a.lastUsedTime;
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(0);

      // b is undefined
      b.lastUsed = undefined;
      b.lastUsedTime = undefined;
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(-1);

      // a is undefined
      b.lastUsed = a.lastUsed;
      b.lastUsedTime = a.lastUsedTime;
      a.lastUsed = undefined;
      a.lastUsedTime = undefined;
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(1);
    });

    it("should correctly compare by utxo list", () => {
      // lastUsed is checked first so need to reset to get to utxo checks
      a.lastUsed = undefined;
      a.lastUsedTime = undefined;
      b.lastUsed = undefined;
      b.lastUsedTime = undefined;

      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(1);
      expect(sliceUtils.compareSlicesByTime(a, b, desc)).toEqual(-1);

      a.utxos = [];
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(-1);
      expect(sliceUtils.compareSlicesByTime(a, b, desc)).toEqual(1);

      b.utxos = [];
      expect(sliceUtils.compareSlicesByTime(a, b)).toEqual(0);
    });

    it("should correctly compare Spent slices", () => {
      // when ascending, spent is after unspent and before unused
      // compare unspent and spent
      expect(sliceUtils.compareSlicesByTime(a, c)).toEqual(-1);
      expect(sliceUtils.compareSlicesByTime(a, c, desc)).toEqual(1);

      // compare spent and unused
      b.utxos = [];
      expect(sliceUtils.compareSlicesByTime(b, c)).toEqual(-1);
      expect(sliceUtils.compareSlicesByTime(b, c, desc)).toEqual(1);
    });
  });

  describe("isChange", () => {
    it("should correctly indicate if a path represents a change braid", () => {
      const validChange = [
        `${DEFAULT_CHANGE_PREFIX}1`,
        `${DEFAULT_CHANGE_PREFIX}50`,
        `m/45'/0'${CHANGE_INDEX}/0`,
      ];
      const invalidChange = [
        `${DEFAULT_PREFIX}/0/1`,
        `${DEFAULT_PREFIX}/0/50`,
        "m/45'/0'/0/0",
        "m/45'/0'/1",
        "0/1",
        "1/1", // looks like change but we want to require a prefix
      ];

      validChange.forEach((path) => {
        assert(
          sliceUtils.isChange(path),
          `Path ${path} should have returned true`
        );
      });

      invalidChange.forEach((path) => {
        assert(
          !sliceUtils.isChange(path),
          `Path ${path} should have returned false`
        );
      });
    });
  });
});
