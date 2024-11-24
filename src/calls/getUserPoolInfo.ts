import {
  BTC_USDC_CALL_ADDRESS,
  ETH_USDC_PUT_ADDRESS,
  BTC_USDC_PUT_ADDRESS,
  MAINNET_AUX_CONTRACT_ADDRESS,
  ETH_STRK_PUT_ADDRESS,
  ETH_STRK_CALL_ADDRESS,
  STRK_USDC_CALL_ADDRESS,
  STRK_USDC_PUT_ADDRESS,
  EKUBO_USDC_CALL_ADDRESS,
  EKUBO_USDC_PUT_ADDRESS,
} from "./../constants/amm";
import { debug } from "./../utils/debugger";
import {
  AMM_METHODS,
  ETH_USDC_CALL_ADDRESS,
  isMainnet,
} from "../constants/amm";
import { ResponseUserPoolInfo } from "../types/pool";
import { AMMContract } from "../utils/blockchain";
import { parseUserPoolInfo } from "../utils/poolParser/parsePool";
import { UserPoolInfo } from "../classes/Pool";
import { Contract } from "starknet";
import AuxAbi from "../abi/aux_abi.json";
import { provider } from "../network/provider";
import { isPromiseFulfilled } from "../utils/utils";

const method = AMM_METHODS.GET_USER_POOL_INFOS;

const getUserPoolInfoAuxContract = async (
  address: string
): Promise<UserPoolInfo[]> => {
  const AuxContract = new Contract(
    AuxAbi,
    MAINNET_AUX_CONTRACT_ADDRESS,
    provider
  );

  const lpAddresses = [
    ETH_USDC_CALL_ADDRESS,
    ETH_USDC_PUT_ADDRESS,
    BTC_USDC_CALL_ADDRESS,
    BTC_USDC_PUT_ADDRESS,
    ETH_STRK_CALL_ADDRESS,
    ETH_STRK_PUT_ADDRESS,
    STRK_USDC_CALL_ADDRESS,
    STRK_USDC_PUT_ADDRESS,
    EKUBO_USDC_CALL_ADDRESS,
    EKUBO_USDC_PUT_ADDRESS,
  ];

  const promises = lpAddresses.map((lpAddress) =>
    AuxContract.call("get_user_pool_info", [address, lpAddress])
  );

  const settledRequests = await Promise.allSettled(promises);

  const response = settledRequests
    .filter(isPromiseFulfilled)
    .map((r) => r.value);

  const parsed = (response as ResponseUserPoolInfo[]).map((v) =>
    parseUserPoolInfo(v)
  );

  return parsed;
};

export const getUserPoolInfo = async (
  address: string
): Promise<UserPoolInfo[]> => {
  if (isMainnet) {
    return await getUserPoolInfoAuxContract(address);
  }
  debug({ method, address, AMMContract });
  const res = await AMMContract.call(method, [address]).catch((e: string) => {
    debug(`Failed while calling ${method}\n`, e);
    throw Error(`Failed while calling ${method}`);
  });

  const parsed = (res as ResponseUserPoolInfo[]).map((v) =>
    parseUserPoolInfo(v)
  );

  return parsed;
};
