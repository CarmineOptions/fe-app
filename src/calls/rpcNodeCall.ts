// Example of "get_option_with_position_of_user" with address "0x03d1525605db970fa1724693404f5f64cba8af82ec4aab514e6ebd3dec4838ad"
// curl -s https://starknet-mainnet.infura.io/v3/df11605e57a14558b13a24a111661f52 \
//     -X POST \
//     -H "Content-Type: application/json" \
//     -d '{"jsonrpc":"2.0","method":"starknet_call", "params": [{
//   "contract_address": "0x76dbabc4293db346b0a56b29b6ea9fe18e93742c73f12348c8747ecfc1050aa",
//   "entry_point_selector": "0x2b20b26ede4304b68503c401a342731579b75844e5696ee13e6286cd51a9621",
//   "calldata": ["0x03d1525605db970fa1724693404f5f64cba8af82ec4aab514e6ebd3dec4838ad"]
import { store } from "../redux/store";
import { NetworkName } from "../types/network";
import { debug } from "../utils/debugger";

export enum RPCNode {
  Infura = "Infura",
  BlastAPI = "BlastAPI",
}

type RPCNodeOkResponse<T> = {
  ok: true;
  data: T;
};

type RPCNodeNokResponse = {
  ok: false;
  err: any;
};

export type RPCNodeResponse<T> = RPCNodeOkResponse<T> | RPCNodeNokResponse;

const getUrl = (rpcNode: RPCNode) => {
  const network = store.getState().network.network.name;

  if (rpcNode === RPCNode.BlastAPI) {
    switch (network) {
      case NetworkName.Testnet:
        return "https://starknet-testnet.blastapi.io/887824dd-2f0b-448d-8549-09598869e9bb";
      case NetworkName.Mainnet:
        return "https://starknet-mainnet.blastapi.io/887824dd-2f0b-448d-8549-09598869e9bb";
      default:
        return "https://starknet-mainnet.blastapi.io/887824dd-2f0b-448d-8549-09598869e9bb";
    }
  }

  if (rpcNode === RPCNode.Infura) {
    switch (network) {
      case NetworkName.Testnet:
        return "https://starknet-goerli.infura.io/v3/df11605e57a14558b13a24a111661f52";
      case NetworkName.Mainnet:
        return "https://starknet-mainnet.infura.io/v3/df11605e57a14558b13a24a111661f52";
      default:
        return "https://starknet-mainnet.infura.io/v3/df11605e57a14558b13a24a111661f52";
    }
  }

  // unreachable
  throw Error("RPCNode not in the list");
};

const getRequestBody = (
  contractAddress: string,
  selector: string,
  calldata: string[]
) => ({
  jsonrpc: "2.0",
  method: "starknet_call",
  id: 0,
  params: [
    {
      contract_address: contractAddress,
      entry_point_selector: selector,
      calldata,
    },
    "latest",
  ],
});

export const rpcNodeCall = async (
  rpcNode: RPCNode,
  contractAddress: string,
  selector: string,
  calldata: string[]
): Promise<RPCNodeResponse<bigint[]>> => {
  const res = await fetch(getUrl(rpcNode), {
    body: JSON.stringify(getRequestBody(contractAddress, selector, calldata)),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((r) => r.json())
    .catch((e) => e);

  if (res.result) {
    return { ok: true, data: res.result };
  }

  debug(`${rpcNode} failed`, res);

  return res;
};
