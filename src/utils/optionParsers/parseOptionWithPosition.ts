import { assert } from "../utils";
import { parseOption } from "./parseOption";
import { Option, OptionWithPosition } from "../../classes/Option";

export const parseOptionWithPosition = (arr: bigint[]): OptionWithPosition => {
  const expectedLength = 9;

  assert(arr.length === expectedLength, "option with position length");

  const option: Option = parseOption(arr.slice(0, 6));

  const position_size = arr[6];
  const value_of_position = arr[8];

  return option.addPosition(position_size, value_of_position);
};
