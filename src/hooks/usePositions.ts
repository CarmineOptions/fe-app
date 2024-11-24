import { QueryKeys } from "../queries/keys";
import { useAccount } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { getOptionsWithPositionOfUser } from "../calls/getOptionsWithPosition";
import { OptionWithPosition } from "../classes/Option";
import { debug } from "../utils/debugger";

export const fetchPositions = async (
  address: string
): Promise<OptionWithPosition[]> => {
  try {
    const options = await getOptionsWithPositionOfUser(address);

    const filtered = options
      .filter((o) => !!o.size)
      .sort((a, b) => a.maturity - b.maturity);

    return filtered;
  } catch (e: unknown) {
    debug("Failed to parse positions", e);
    throw Error(typeof e === "string" ? e : "Failed to parse positions");
  }
};

export const usePositions = () => {
  const { address } = useAccount();

  return useQuery({
    queryKey: [QueryKeys.position, address],
    queryFn: async () => fetchPositions(address!),
    enabled: !!address,
  });
};
