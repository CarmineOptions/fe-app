import { Contract } from "starknet";
import { OptionWithPosition, Option } from "../../classes/Option";
import { AMM_METHODS, LEGACY_AMM } from "../../constants/amm";
import { debug } from "../../utils/debugger";
import { provider } from "../../network/provider";

import LegacyAmmAbi from "../../abi/legacy_amm_abi.json";
import { QueryFunctionContext } from "react-query";
import { parseBatchOfOptions } from "../../utils/optionParsers/batch";

const method = AMM_METHODS.GET_OPTION_WITH_POSITION_OF_USER;

type Response = {
  array: bigint[];
};

const LegacyAmmContract = new Contract(LegacyAmmAbi, LEGACY_AMM, provider);

export const getLegacyPositionsOfUser = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  OptionWithPosition[]
> => {
  const address = queryKey[1];
  if (!address) {
    throw Error("No address");
  }

  const res = (await LegacyAmmContract.call(method, [address]).catch(
    (e: Error) => {
      debug("Failed while calling", method);
      throw Error(e.message);
    }
  )) as Response;

  const parseFn = (arr: bigint[]) => {
    console.log(arr);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [side, maturity, strike, quote, base, type, size, _, value] = arr;

    const opt = new Option(base, quote, type, side, maturity, strike);
    const optionWithPosition = opt.addPosition(size, value);
    return optionWithPosition;
  };

  const parsed = parseBatchOfOptions(res.array, 9, parseFn);

  const withPosition = parsed.filter((option) => option.value > 0n);

  return withPosition;
};
