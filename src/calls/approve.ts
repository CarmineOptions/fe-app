import { AMM_ADDRESS, AMM_METHODS } from "../constants/amm";
import { AccountInterface } from "starknet";
import { debug, LogTypes } from "../utils/debugger";
import { Option } from "../classes/Option";

export const approve = async (
  option: Option,
  account: AccountInterface,
  amount: string
) => {
  const contractAddress = option.underlying.address;
  try {
    const call = {
      contractAddress,
      entrypoint: AMM_METHODS.APPROVE,
      calldata: [AMM_ADDRESS, BigInt(amount), 0],
    };
    const res = await account.execute(call);
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
