import { Dispatch } from "react";
import { BlockchainClient, ClientType } from "../clients/client";

export const SET_CLIENT_TYPE = "SET_CLIENT_TYPE";
export const SET_CLIENT_URL = "SET_CLIENT_URL";
export const SET_CLIENT_USERNAME = "SET_CLIENT_USERNAME";
export const SET_CLIENT_PASSWORD = "SET_CLIENT_PASSWORD";

export const SET_CLIENT_URL_ERROR = "SET_CLIENT_URL_ERROR";
export const SET_CLIENT_USERNAME_ERROR = "SET_CLIENT_USERNAME_ERROR";
export const SET_CLIENT_PASSWORD_ERROR = "SET_CLIENT_PASSWORD_ERROR";

export const SET_BLOCKCHAIN_CLIENT = "SET_BLOCKCHAIN_CLIENT";

// TODO: use this to add more flexibility to client support
// For example, this defaults to blockstream for public client
// but can also support mempool.space as an option
export const getBlockchainClientFromStore = async () => {
  return async (
    dispatch: Dispatch<any>,
    getState: () => { settings: any; client: any }
  ) => {
    const { network } = getState().settings;
    const { client } = getState();
    if (!client) return;
    let clientType: ClientType;

    switch (client.type) {
      case "public":
        clientType = ClientType.BLOCKSTREAM;
        break;
      case "private":
        clientType = ClientType.PRIVATE;
        break;
      default:
        // this allows us to support other clients in the future
        // like mempool.space
        clientType = client.type;
    }

    const blockchainClient = new BlockchainClient({
      client,
      type: clientType,
      network,
      throttled: true,
    });
    dispatch({ type: SET_BLOCKCHAIN_CLIENT, value: blockchainClient });
    return blockchainClient;
  };
};
