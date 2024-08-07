import { apiUrl } from "../api";
import { OptionWithPremia } from "../classes/Option";
import { NETWORK } from "../constants/amm";
import { AMMContract } from "../utils/blockchain";
import { parseBatchOfOptions } from "../utils/optionParsers/batch";
import { parseNonExpiredOption } from "../utils/optionParsers/parseNonExpiredOption";

export const getNonExpiredOptions = async (): Promise<OptionWithPremia[]> =>
  fetch(apiUrl("live-options", { network: NETWORK }))
    .then((res) => res.json())
    .then((res) => {
      if (res?.status !== "success" || !res?.data?.length) {
        return [];
      }

      const optionsWithPremia = parseBatchOfOptions(
        res.data.map(BigInt),
        9,
        parseNonExpiredOption
      );

      return optionsWithPremia;
    });

export const getNonExpiredFromChain = async () => {
  const res = await AMMContract.call(
    "get_all_non_expired_options_with_premia",
    ["0x750815fd991718f5b6b278a38dc9f9d40da87da8309b4533ef6eb389a8544e9"],
    { parseResponse: false } // currently starknet-js cannot parse tuple, gotta format manually
  ).catch((e: Error) => {
    console.log("upsie", e);
    throw Error(e.message);
  });

  if (!res) {
    throw Error("big sad");
  }

  // first element is length
  const valid = (res as string[]).slice(1);
  console.log("to be parsed as options:", res, valid);

  const optionsWithPremia = parseBatchOfOptions(
    valid.map(BigInt),
    9,
    parseNonExpiredOption
  );

  return optionsWithPremia;
};
