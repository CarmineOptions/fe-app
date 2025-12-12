import { Contract } from "starknet";
import { GOVERNANCE_ADDRESS } from "./amm";
import { provider } from "../network/provider";

import GovernanceABI from "../abi/governance_abi.json";

export const TESTNET_CHAINID = "0x534e5f474f45524c49";

export const governanceContract = new Contract({
  abi: GovernanceABI,
  address: GOVERNANCE_ADDRESS,
  providerOrAccount: provider,
});
