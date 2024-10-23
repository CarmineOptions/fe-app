import { OptionWithPosition } from "../../classes/Option";
import { debug } from "../../utils/debugger";
import { QueryFunctionContext } from "@tanstack/react-query";
import { getOptionsWithPositionOfUser } from "../../calls/getOptionsWithPosition";
import { parseBatchOfOptions } from "../../utils/optionParsers/batch";
import { parseOptionWithPosition } from "../../utils/optionParsers/parseOptionWithPosition";

export const fetchPositions = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  OptionWithPosition[] | undefined
> => {
  const address = queryKey[1];
  if (!address) return;

  try {
    const options = await getOptionsWithPositionOfUser(address);

    // remove position with size 0 (BE rounding error)
    const filtered = options
      .filter((o) => !!o.size)
      .sort((a, b) => a.maturity - b.maturity);

    return filtered;
  } catch (e: unknown) {
    debug("Failed to parse positions", e);
    throw Error(typeof e === "string" ? e : "Failed to parse positions");
  }
};

export const mockFetchPositions = async (): Promise<OptionWithPosition[]> =>
  fetch("http://localhost:3001/positions")
    .then((res) => res.json())
    .then((res) => {
      if (res?.status !== "success" || !res?.data?.length) {
        return [];
      }
      const options = parseBatchOfOptions(
        res.data.map((v: string) => BigInt(v)),
        9,
        parseOptionWithPosition
      );

      return options;
    });
