import { assert } from "../utils";
import { parseOption } from "./parseOption";
import { OptionWithPremia } from "../../classes/Option";
import { debug } from "../debugger";

export const parseNonExpiredOption = (arr: bigint[]): OptionWithPremia => {
  const expectedLength = 9;

  assert(arr.length === expectedLength, "non expired option length");

  // check strike and premia cubit that it is not negative
  if (BigInt(arr[3]) !== 0n || BigInt(arr[8]) !== 0n) {
    debug("negative cubit in option", arr);
    throw Error(`Negativ cubit in option ${JSON.stringify(arr)}`);
  }

  const option = parseOption(arr.slice(0, 7));

  const premia = arr[7];

  return option.addPremia(premia);
};
