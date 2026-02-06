import { useAccount } from "@starknet-react/core";
import { coreTeamAddresses } from "../constants/amm";
import { standardiseAddress } from "../utils/utils";

export const useCoreTeam = () => {
  const { address } = useAccount();

  if (address === undefined) {
    return false;
  }

  return coreTeamAddresses.includes(standardiseAddress(address));
};
