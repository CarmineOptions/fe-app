import { assert } from "../utils";
import { Option } from "../../classes/Option";

export const parseOption = (arr: bigint[]): Option => {
  const expectedLength = 7;

  assert(arr.length === expectedLength, "option with position length");

  return new Option(arr[5], arr[4], arr[6], arr[0], arr[1], arr[2]);
};
