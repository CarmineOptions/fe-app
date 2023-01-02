import { AMM_METHODS, getTokenAddresses } from "../constants/amm";
import AmmAbi from "../abi/amm_abi.json";
import { Abi, AccountInterface } from "starknet";
import { RawOption } from "../types/options";
import { rawOptionToCalldata } from "../utils/parseOption";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";

export const tradeClose = async (
  account: AccountInterface,
  rawOption: RawOption,
  amount: string
) => {
  try {
    const call = {
      contractAddress: getTokenAddresses().MAIN_CONTRACT_ADDRESS,
      entrypoint: AMM_METHODS.TRADE_CLOSE,
      calldata: rawOptionToCalldata(rawOption, amount),
    };
    debug("Executing following call:", call);
    const res = await account.execute(call, [AmmAbi] as Abi[]);
    if (res?.transaction_hash) {
      afterTransaction(res.transaction_hash, invalidatePositions);
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
