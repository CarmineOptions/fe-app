import { FinancialData } from "../../types/options";
import { getPremia } from "../../calls/getPremia";
import { LogTypes, debug } from "../../utils/debugger";
import { math64toDecimal } from "../../utils/units";
import { balanceOf } from "../../calls/balanceOf";
import { OptionWithPremia } from "../../classes/Option";

type ModalData = {
  prices: FinancialData;
  premiaMath64: bigint;
  balance?: bigint;
};

export const fetchModalData = async (
  size: number,
  option: OptionWithPremia,
  address: string | undefined,
  signal: AbortSignal
): Promise<ModalData | undefined> => {
  const [{ base, quote }, premiaMath64, balance] = await Promise.all([
    option.tokenPricesInUsd(),
    getPremia(option, size, false),
    address ? balanceOf(address, option.underlying.address) : undefined,
  ]).catch((e: Error) => {
    debug("Failed fetching ETH or premia", e.message);
    debug(LogTypes.ERROR, e);
    throw e;
  });

  debug("Fetched ETH, premia and user balance", {
    base,
    quote,
    premiaMath64,
    balance,
  });

  if (signal.aborted) {
    return;
  }

  const convertedPremia = math64toDecimal(premiaMath64);

  return {
    prices: option.financialData(size, convertedPremia, base, quote),
    premiaMath64: premiaMath64,
    balance,
  };
};
