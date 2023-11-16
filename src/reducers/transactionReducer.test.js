import BigNumber from "bignumber.js";
import {
  P2WSH,
  Network,
  satoshisToBitcoins,
  estimateMultisigP2WSHTransactionVSize,
} from "unchained-bitcoin";
import { SET_NETWORK, SET_ADDRESS_TYPE } from "../actions/settingsActions";
import {
  CHOOSE_PERFORM_SPEND,
  SET_REQUIRED_SIGNERS,
  SET_TOTAL_SIGNERS,
  SET_INPUTS,
  ADD_OUTPUT,
  SET_OUTPUT_ADDRESS,
  SET_OUTPUT_AMOUNT,
  DELETE_OUTPUT,
  SET_FEE_RATE,
  SET_FEE,
  FINALIZE_OUTPUTS,
  RESET_OUTPUTS,
  SET_TXID,
} from "../actions/transactionActions";
import reducer, {
  initialOutputState,
  initialState,
} from "./transactionReducer";

describe("Test transactionReducer", () => {
  describe("Test CHOOSE_PERFORM_SPEND action", () => {
    it("should properly set to chosen state", () => {
      const r = reducer(
        {
          chosen: false,
        },
        {
          type: CHOOSE_PERFORM_SPEND,
        }
      );
      expect(r.chosen).toBe(true);
    });
  });

  describe("Test SET_REQUIRED_SIGNERS action", () => {
    it("should properly set the number of required signers", () => {
      [1, 2, 3, 4, 5, 6, 7].forEach((m) => {
        const r = reducer(
          {
            requiredSigners: 2,
            signingKeys: [0, 0],
          },
          {
            type: SET_REQUIRED_SIGNERS,
            value: m,
          }
        );
        expect(r.requiredSigners).toEqual(m);
        expect(r.signingKeys).toHaveLength(m);
      });
    });
  });

  describe("Test SET_TOTAL_SIGNERS action", () => {
    it("should properly set the number of total signers", () => {
      [2, 3, 4, 5, 6, 7].forEach((m) => {
        const r = reducer(
          {
            totalSigners: 2,
          },
          {
            type: SET_TOTAL_SIGNERS,
            value: m,
          }
        );
        expect(r.totalSigners).toEqual(m);
      });
    });
  });

  describe("Test SET_INPUTS action", () => {
    it("should properly set inputs", () => {
      const sats = "40000";
      const expected = {
        txid: "0000000000000000",
        index: 0,
        amountSats: BigNumber(sats),
      };
      const r = reducer(
        {
          inputs: [],
          inputsTotalSats: new BigNumber(0),
          outputs: [],
        },
        {
          type: SET_INPUTS,
          value: [expected],
        }
      );
      expect(r.inputs).toEqual([expected]);
      expect(r.inputsTotalSats).toStrictEqual(BigNumber(sats));
    });
  });

  describe("Test ADD_OUTPUT action", () => {
    it("should properly add an empty output", () => {
      const expected = {
        address: "",
        amount: "",
        amountSats: "",
        addressError: "",
        amountError: "",
      };
      const r = reducer(
        {
          inputs: [],
          outputs: [],
        },
        {
          type: ADD_OUTPUT,
        }
      );
      expect(r.outputs).toEqual([expected]);
    });
  });

  describe("Test SET_OUTPUT_ADDRESS action", () => {
    it("should properly set output address", () => {
      const initial = initialOutputState();
      const address = "2MzZgrQq6Qa7U1p24eNx6N2wrpCr8bEpdeH";
      const r = reducer(
        {
          inputs: [],
          outputs: [initial],
        },
        {
          type: SET_OUTPUT_ADDRESS,
          value: address,
          number: 1,
        }
      );
      expect(r.outputs[0].address).toEqual(address);
    });

    it("should properly reject duplicate output address", () => {
      const initial = initialOutputState();
      const address = "2MzZgrQq6Qa7U1p24eNx6N2wrpCr8bEpdeH";
      initial.address = address;
      const r = reducer(
        {
          inputs: [],
          outputs: [{ address }, initialOutputState()],
          network: Network.TESTNET,
        },
        {
          type: SET_OUTPUT_ADDRESS,
          value: address,
          number: 2,
        }
      );
      expect(r.outputs[1].addressError).toEqual("Duplicate output address.");
    });

    it("should properly reject output address equal to input address", () => {
      const initial = initialOutputState();
      const address = "2MzZgrQq6Qa7U1p24eNx6N2wrpCr8bEpdeH";
      initial.address = address;
      const input = { multisig: { address } };
      const r = reducer(
        {
          inputs: [input],
          outputs: [initialOutputState()],
          network: Network.TESTNET,
        },
        {
          type: SET_OUTPUT_ADDRESS,
          value: address,
          number: 1,
        }
      );
      expect(r.outputs[0].addressError).toEqual(
        "Output address cannot equal input address."
      );
    });
  });

  describe("Test SET_OUTPUT_AMOUNT action", () => {
    it("should properly set output amount", () => {
      const initial = initialOutputState();
      const r = reducer(
        {
          inputs: [],
          outputs: [initial],
        },
        {
          type: SET_OUTPUT_AMOUNT,
          value: "0.00001234",
          number: 1,
        }
      );
      expect(r.outputs[0].amountSats).toEqual("1234");
    });
  });

  describe("Test DELETE_OUTPUT action", () => {
    it("should properly remove an output and update fee", () => {
      const initial = [initialOutputState(), initialOutputState()];
      const r = reducer(
        {
          inputs: [{}],
          outputs: initial,
          feeRate: "1",
          addressType: P2WSH,
          requiredSigners: 2,
          totalSigners: 3,
        },
        {
          type: DELETE_OUTPUT,
          number: 1,
        }
      );
      // test txid for reference:
      // e5d35e77a9177e52eb2e908d133faa3c8f9dc0d5a947f25568a55f711f0ee87b
      expect(r.outputs.length).toBe(1);
      expect(r.fee).toEqual("0.00000159");
    });
  });

  describe("Test SET_FEE_RATE action", () => {
    it("should properly set fee rate and update fee", () => {
      const r = reducer(
        {
          inputs: [{}],
          outputs: [{}],
          addressType: P2WSH,
          requiredSigners: 2,
          totalSigners: 3,
          feeRate: 1,
        },
        {
          type: SET_FEE_RATE,
          value: "3",
        }
      );
      expect(r.feeRate).toEqual("3");
      const estimatedSize = estimateMultisigP2WSHTransactionVSize({
        numInputs: r.inputs.length,
        numOutputs: r.outputs.length,
        m: r.requiredSigners,
        n: r.totalSigners,
      });

      // test txid for reference:
      // e5d35e77a9177e52eb2e908d133faa3c8f9dc0d5a947f25568a55f711f0ee87b
      const expectedRate = satoshisToBitcoins(estimatedSize * r.feeRate);

      expect(r.fee).toEqual(expectedRate);
    });
  });

  describe("Test SET_FEE action", () => {
    it("should properly set fee and update fee rate", () => {
      const r = reducer(
        {
          ...initialState(),
          inputs: [{}],
          outputs: [{}],
          addressType: P2WSH,
          requiredSigners: 2,
          totalSigners: 3,
          inputsTotalSats: "929572",
        },
        {
          type: SET_FEE,
          value: "0.00000504",
        }
      );

      expect(r.fee).toEqual("0.00000504");
    });
  });

  describe("Test FINALIZE_OUTPUTS action", () => {
    it("should properly finalize outputs", () => {
      const action = {
        type: FINALIZE_OUTPUTS,
        value: true,
      };
      const r = reducer(
        {
          ...initialState(),
          inputs: [
            {
              txid: "19e354df0b3d98071ec70b2035aa376727021e7f6befe569c4a648d25215f263",
              index: 0,
              amountSats: BigNumber(112233),
              multisig: {
                address:
                  "bc1qxkl8fcuas3fv6mk79tk7d0nsug0909qcgvpjuj2asgltnafp46nsn4jnrh",
              },
            },
          ],
          outputs: [
            {
              address: "3DRVz9YUhoXSMgBngvv2JkNReBHvkeJwLs",
              amountSats: BigNumber(111892),
            },
          ],
          addressType: P2WSH,
          requiredSigners: 2,
          totalSigners: 3,
          feeRate: 1,
          finalizedOutputs: false,
        },
        action
      );
      expect(r.finalizedOutputs).toBe(action.value);
    });
  });

  describe("Test RESET_OUTPUTS action", () => {
    it("should properly reset outputs", () => {
      const r = reducer(
        {
          inputs: [{}],
          outputs: [{}],
          fee: "0.00000504",
          balanceError: "Bad balance",
        },
        {
          type: RESET_OUTPUTS,
        }
      );
      expect(r.outputs).toEqual([initialOutputState()]);
      expect(r.fee).toEqual("");
      expect(r.balanceError).toEqual("");
    });
  });

  describe("Test SET_ADDRESS_TYPE action", () => {
    it("should properly set address type", () => {
      const r = reducer(
        {
          addressType: "P2SH",
        },
        {
          type: SET_ADDRESS_TYPE,
          value: "P2WSH",
        }
      );
      expect(r.addressType).toEqual("P2WSH");
    });
  });

  describe("Test SET_NETWORK action", () => {
    it("should properly set network", () => {
      const r = reducer(
        {
          network: "MAINNET",
        },
        {
          type: SET_NETWORK,
          value: "TESTNET",
        }
      );
      expect(r.network).toEqual("TESTNET");
    });
  });

  describe("Test SET_TXID action", () => {
    it("should properly set network", () => {
      const txid =
        "0000000000000000000000000000000000000000000000000000000000000000";
      const r = reducer(
        {
          txid: "",
        },
        {
          type: SET_TXID,
          value: txid,
        }
      );
      expect(r.txid).toEqual(txid);
    });
  });
});
