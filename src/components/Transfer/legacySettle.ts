import { Abi, AccountInterface, Call } from "starknet";
import { OptionWithPosition } from "../../classes/Option";
import { AMM_METHODS, LEGACY_AMM } from "../../constants/amm";
import { afterTransaction } from "../../utils/blockchain";
import { debug, LogTypes } from "../../utils/debugger";

import LegacyAbi from "../../abi/legacy_amm_abi.json";

const generateMulticall = (options: OptionWithPosition[]) => {
  const calls: Call[] = [];
  const abis: Abi[] = [];

  options.forEach((option) => {
    calls.push({
      contractAddress: LEGACY_AMM,
      entrypoint: AMM_METHODS.TRADE_SETTLE,
      calldata: [
        option.type,
        option.strikeHex,
        option.maturity,
        option.side,
        option.fullSize,
        option.quoteToken,
        option.baseToken,
      ],
    });
    abis.push(LegacyAbi);
  });

  return { calls, abis };
};

export const legacyTradeSettle = async (
  account: AccountInterface,
  options: OptionWithPosition[]
) => {
  try {
    const { calls, abis } = generateMulticall(options);

    const res = await account.execute(calls, abis);

    if (res?.transaction_hash) {
      afterTransaction(
        res.transaction_hash,
        () => console.log("DONE"),
        () => console.log("FAILED")
      );
    }
    return res;
  } catch (e) {
    debug(LogTypes.ERROR, e);
    return null;
  }
};
