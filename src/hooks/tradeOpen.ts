import { AMM_METHODS, MAIN_CONTRACT_ADDRESS } from "../constants/amm";
import AmmAbi from "../abi/amm_abi.json";
import {
  Abi,
  AccountInterface,
  InvokeFunctionResponse,
  Provider,
} from "starknet";
import { RawOption } from "../types/options";
import { approve } from "./approve";
import { rawOptionToCalldata } from "../utils/parseOption";

export const tradeOpen = async (
  account: AccountInterface,
  rawOption: RawOption,
  amount: number
) => {
  try {
    const call = {
      contractAddress: MAIN_CONTRACT_ADDRESS,
      entrypoint: AMM_METHODS.TRADE_OPEN,
      calldata: rawOptionToCalldata(rawOption, amount),
    };
    console.log("Executing following call:", call);
    const res = await account.execute(call, [AmmAbi] as Abi[]);
    return res;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const approveAndTrade = async (
  account: AccountInterface,
  address: string,
  rawOption: RawOption,
  amount: number
): Promise<InvokeFunctionResponse | null> => {
  const provider = new Provider();

  const approveResponse = await approve(account, address, amount);

  console.log("Approve response", approveResponse);

  if (!approveResponse?.transaction_hash) {
    return null;
  }

  await provider.waitForTransaction(approveResponse.transaction_hash);

  const tradeResponse = await tradeOpen(account, rawOption, amount);

  console.log("Done trading!", tradeResponse);

  return tradeResponse;
};
