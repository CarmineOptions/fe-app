import { AMM_METHODS, getTokenAddresses } from "../constants/amm";
import AmmAbi from "../abi/amm_abi.json";
import { AccountInterface } from "starknet";
import { OptionWithPosition } from "../types/options";
import { rawOptionToCalldata } from "../utils/parseOption";
import { debug, LogTypes } from "../utils/debugger";
import { invalidatePositions } from "../queries/client";
import { afterTransaction } from "../utils/blockchain";
import { getPremiaWithSlippage, longInteger } from "../utils/computations";
import { intToMath64x61 } from "../utils/units";
import { digitsByType } from "../utils/utils";
import BN from "bn.js";

export const tradeClose = async (
  account: AccountInterface,
  option: OptionWithPosition,
  premia: BN,
  size: number
) => {
  const { optionSide, optionType } = option.parsed;

  debug({
    premia,
    size,
    premiaSlippage: getPremiaWithSlippage(premia, optionSide).toString(10),
  });

  try {
    // one hour from now
    const deadline = String(Math.round(new Date().getTime() / 1000) + 60 * 60);

    const call = {
      contractAddress: getTokenAddresses().MAIN_CONTRACT_ADDRESS,
      entrypoint: AMM_METHODS.TRADE_CLOSE,
      calldata: [
        ...rawOptionToCalldata(
          option.raw,
          longInteger(size, digitsByType(option.parsed.optionType)).toString(10)
        ),
        intToMath64x61(
          getPremiaWithSlippage(premia, optionSide).toString(10),
          digitsByType(optionType)
        ),
        deadline,
      ],
    };
    debug("Executing following call:", call);
    const res = await account.execute(call, [AmmAbi]);
    if (res?.transaction_hash) {
      afterTransaction(res.transaction_hash, invalidatePositions);
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
