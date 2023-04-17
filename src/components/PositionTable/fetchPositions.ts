import { OptionWithPosition } from "../../classes/Option";
import { debug } from "../../utils/debugger";
import { isNonEmptyArray } from "../../utils/utils";
import { QueryFunctionContext } from "react-query";
import { getOptionsWithPositionOfUser } from "../../calls/getOptionsWithPosition";
import { parseBatchOfOptions } from "../../utils/optionParsers/batch";
import { parseOptionWithPosition } from "../../utils/optionParsers/parseOptionWithPosition";

export const fetchPositions = async ({
  queryKey,
}: QueryFunctionContext<[string, string | undefined]>): Promise<
  OptionWithPosition[]
> => {
  const address = queryKey[1];
  if (!address) {
    throw Error("No address");
  }

  try {
    const rawData = await getOptionsWithPositionOfUser(address);

    const options = parseBatchOfOptions(rawData, 9, parseOptionWithPosition);

    if (!isNonEmptyArray(options)) {
      return [];
    }

    // remove position with size 0 (BE rounding error)
    const filtered = options
      .filter(({ parsed }) => !!parsed.positionSize)
      .sort((a, b) => a.parsed.maturity - b.parsed.maturity);

    debug("Fetched options with position", filtered);
    return filtered;
  } catch (e: unknown) {
    debug("Failed to parse positions", e);
    throw Error(typeof e === "string" ? e : "Failed to parse positions");
  }
};
