import axios, { Method } from "axios";
import { Network, satoshisToBitcoins, sortInputs } from "unchained-bitcoin";
import {
  bitcoindEstimateSmartFee,
  bitcoindGetAddressStatus,
  bitcoindListUnspent,
  bitcoindParams,
  bitcoindSendRawTransaction,
  isWalletAddressNotFoundError,
  callBitcoind,
} from "./bitcoind";
import BigNumber from "bignumber.js";

interface UTXO {
  txid: string;
  vout: number;
  value: number;
  status: {
    confirmed: boolean;
    block_time: number;
  };
}

export enum ClientType {
  PRIVATE = "private",
  BLOCKSTREAM = "blockstream",
  MEMPOOL = "mempool",
}
const delay = () => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};

export class ClientBase {
  private readonly throttled: boolean;
  public readonly host: string;

  constructor(throttled: boolean, host: string) {
    this.throttled = throttled;
    this.host = host;
  }

  private async throttle() {
    if (this.throttled) {
      await delay();
    }
  }

  private async Request(method: Method, path: string, data?: any) {
    await this.throttle();
    try {
      const response = await axios.request({
        method,
        url: this.host + path,
        data,
      });
      return response.data;
    } catch (e) {
      throw (e.response && e.response.data) || e;
    }
  }

  public async Get(path: string) {
    return this.Request("GET", path);
  }

  public async Post(path: string, data?: any) {
    return this.Request("POST", path, data);
  }
}

export class BlockchainClient extends ClientBase {
  public readonly type: ClientType;
  public readonly network?: Network;
  public readonly bitcoindParams: {
    url: string;
    auth: {
      username: string;
      password: string;
    };
  };

  constructor({
    type,
    network,
    throttled = false,
    client = {
      url: "",
      username: "",
      password: "",
    },
  }: {
    type: ClientType;
    network?: Network;
    throttled?: boolean;
    client?: {
      url: string;
      username: string;
      password: string;
    };
  }) {
    // regtest not supported by public explorers
    if (
      type !== ClientType.PRIVATE &&
      network !== Network.MAINNET &&
      network !== Network.TESTNET &&
      network !== Network.SIGNET
    ) {
      throw new Error("Invalid network");
    }
    if (type !== ClientType.MEMPOOL && network === Network.SIGNET) {
      throw new Error("Invalid network");
    }

    let host = "";

    if (type === ClientType.BLOCKSTREAM) {
      host = "https://blockstream.info";
    } else if (type === ClientType.MEMPOOL) {
      host = "https://mempool.space";
    }
    if (type !== ClientType.PRIVATE && network !== Network.MAINNET) {
      host += `/${network}`;
    }
    if (type === ClientType.BLOCKSTREAM) {
      host += "/api";
    } else if (type === ClientType.MEMPOOL) {
      host += "/api/v1";
    }
    super(throttled, host);
    this.network = network;
    this.type = type;
    this.bitcoindParams = bitcoindParams(client);
  }

  public async getAddressUtxos(address: string): Promise<any> {
    try {
      if (this.type === ClientType.PRIVATE) {
        return bitcoindListUnspent({
          address,
          ...this.bitcoindParams,
        });
      }
      return await this.Get(`/address/${address}/utxo`);
    } catch (error) {
      throw new Error(
        `Failed to get UTXOs for address ${address}: ${error.message}`
      );
    }
  }

  public async broadcastTransaction(rawTx: string): Promise<any> {
    try {
      if (this.type === ClientType.PRIVATE) {
        return bitcoindSendRawTransaction({
          hex: rawTx,
          ...this.bitcoindParams,
        });
      }
      return await this.Post(`/tx`, { tx: rawTx });
    } catch (error) {
      throw new Error(`Failed to broadcast transaction: ${error.message}`);
    }
  }

  public async formatUtxo(utxo: UTXO): Promise<any> {
    const transactionHex = await this.getTransactionHex(utxo.txid);
    const amount = new BigNumber(utxo.value);
    return {
      confirmed: utxo.status.confirmed,
      txid: utxo.txid,
      index: utxo.vout,
      amount: satoshisToBitcoins(utxo.value),
      amountSats: amount,
      transactionHex,
      time: utxo.status.block_time,
    };
  }

  public async fetchAddressUtxos(address: string): Promise<any> {
    let unsortedUTXOs;

    let updates = {
      utxos: [],
      balanceSats: BigNumber(0),
      addressKnown: true,
      fetchedUTXOs: false,
      fetchUTXOsError: "",
    };
    try {
      if (this.type === ClientType.PRIVATE) {
        unsortedUTXOs = await bitcoindListUnspent({
          ...this.bitcoindParams,
          address,
        });
      } else {
        const utxos: UTXO[] = await this.Get(`/address/${address}/utxo`);
        unsortedUTXOs = await Promise.all(
          utxos.map(async (utxo) => await this.formatUtxo(utxo))
        );
      }
    } catch (error: Error | any) {
      if (this.type === "private" && isWalletAddressNotFoundError(error)) {
        updates = {
          utxos: [],
          balanceSats: BigNumber(0),
          addressKnown: false,
          fetchedUTXOs: true,
          fetchUTXOsError: "",
        };
      } else {
        updates = { ...updates, fetchUTXOsError: error.toString() };
      }
    }
    // if no utxos then return updates object as is
    if (!unsortedUTXOs) return updates;

    // sort utxos
    const utxos = sortInputs(unsortedUTXOs);
    interface ExtendedUtxo extends UTXO {
      amountSats: BigNumber;
      transactionHex: string;
      time: number;
    }
    // calculate the total balance from all utxos
    const balanceSats = utxos
      .map((utxo: ExtendedUtxo) => utxo.amountSats)
      .reduce(
        (accumulator: BigNumber, currentValue: BigNumber) =>
          accumulator.plus(currentValue),
        new BigNumber(0)
      );

    return {
      ...updates,
      balanceSats,
      utxos,
      fetchedUTXOs: true,
      fetchUTXOsError: "",
    };
  }

  public async getAddressStatus(address: string): Promise<any> {
    try {
      if (this.type === ClientType.PRIVATE) {
        return await bitcoindGetAddressStatus({
          address,
          ...this.bitcoindParams,
        });
      }
      const addressData = await this.Get(`/address/${address}`);
      return {
        used:
          addressData.chain_stats.funded_txo_count > 0 ||
          addressData.mempool_stats.funded_txo_count > 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get status for address ${address}: ${error.message}`
      );
    }
  }

  public async getFeeEstimate(blocks: number = 3): Promise<any> {
    let fees;
    try {
      switch (this.type) {
        case ClientType.PRIVATE:
          return bitcoindEstimateSmartFee({
            numBlocks: blocks,
            ...this.bitcoindParams,
          });
        case ClientType.BLOCKSTREAM:
          fees = await this.Get(`/fee-estimates`);
          return fees[blocks];
        case ClientType.MEMPOOL:
          fees = await this.Get("/fees/recommended");
          if (blocks === 1) {
            return fees.fastestFee;
          } else if (blocks <= 3) {
            return fees.halfHourFee;
          } else if (blocks <= 6) {
            return fees.hourFee;
          } else {
            return fees.economyFee;
          }
        default:
          throw new Error("Invalid client type");
      }
    } catch (error) {
      throw new Error(`Failed to get fee estimate: ${error.message}`);
    }
  }

  public async getTransactionHex(txid: string): Promise<any> {
    try {
      if (this.type === ClientType.PRIVATE) {
        return await callBitcoind(
          this.bitcoindParams.url,
          this.bitcoindParams.auth,
          "gettransaction",
          [txid]
        );
      }
      return await this.Get(`/tx/${txid}/hex`);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }
}
