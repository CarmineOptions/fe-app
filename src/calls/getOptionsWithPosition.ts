import { AMM_METHODS } from "../constants/amm";
import { debug } from "../utils/debugger";
import { AMMContract } from "../utils/blockchain";
import { Option, OptionWithPosition } from "../classes/Option";
import { OptionStruct } from "../types/options";
import { cubit } from "../types/units";

const method = AMM_METHODS.GET_OPTION_WITH_POSITION_OF_USER;

type Response = {
  option: OptionStruct;
  position_size: bigint;
  value_of_position: cubit;
};

export const getOptionsWithPositionOfUser = async (
  address: string
): Promise<OptionWithPosition[]> => {
  const res = await AMMContract.call(method, [address]).catch((e: Error) => {
    debug("Failed while calling", method);
    throw Error(e.message);
  });

  const parsed = (res as Response[]).map(
    ({ option, position_size, value_of_position }) => {
      const opt = new Option(
        option.base_token_address,
        option.quote_token_address,
        option.option_type,
        option.option_side,
        option.maturity,
        option.strike_price.mag
      );
      const optionWithPosition = opt.addPosition(
        position_size,
        value_of_position.mag
      );
      return optionWithPosition;
    }
  );

  return parsed;
};
