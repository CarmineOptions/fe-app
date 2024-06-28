import { UserBalance } from "./../types/wallet";
import { AccountInterface, Contract } from "starknet";
import ABI from "../abi/lptoken_abi.json";
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
  VE_CRM_ADDRESS,
} from "../constants/amm";
import { Token, TokenKey } from "../classes/Token";
import { provider } from "../network/provider";

const CARM_TOKEN_ADDRESS =
  "0x3c0286e9e428a130ae7fbbe911b794e8a829c367dd788e7cfe3efb0367548fa";

export const balanceFromTokenAddress = async (
  account: AccountInterface,
  tokenAddress: string
): Promise<bigint> => {
  const contract = new Contract(ABI, tokenAddress, account);
  const balance = await contract.balanceOf(account.address);
  return balance;
};

export const balanceFromKey = async (
  account: AccountInterface,
  token: TokenKey
): Promise<bigint> => {
  const address = Token.byKey(token).address;
  const contract = new Contract(ABI, address, provider);
  const balance = await contract.balanceOf(account.address);
  return balance;
};

export const balanceOfEth = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, ETH_ADDRESS);
};

export const balanceOfUsdc = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, USDC_ADDRESS);
};

export const balanceOfBtc = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, BTC_ADDRESS);
};

export const balanceOfStrk = async (
  account: AccountInterface
): Promise<bigint> => {
  return balanceFromTokenAddress(account, STRK_ADDRESS);
};

export const balanceOfCarmineToken = async (
  account: AccountInterface
): Promise<bigint> => balanceFromTokenAddress(account, VE_CRM_ADDRESS);

export const balanceOf = async (
  address: string,
  token: string
): Promise<bigint> => {
  const contract = new Contract(ABI, token, provider);
  const balance = await contract.balanceOf(address);
  return balance;
};

export const getUserBalance = async (
  account: AccountInterface
): Promise<UserBalance | undefined> => {
  const promises = Object.values(TokenKey).map((tokenKey) =>
    balanceFromKey(account, tokenKey)
  );
  const values = await Promise.all(promises);
  return Object.values(TokenKey).reduce((acc, tokenKey, index) => {
    acc[tokenKey as TokenKey] = values[index];
    return acc;
  }, {} as UserBalance);
};
