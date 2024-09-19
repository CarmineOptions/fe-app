import { Contract } from "starknet";
import { GOVERNANCE_ADDRESS, IMP_LOSS_ADDRESS } from "./amm";
import { provider } from "../network/provider";

import GovernanceABI from "../abi/governance_abi.json";
import ImpLossABI from "../abi/imp_loss_abi.json";

export const TESTNET_CHAINID = "0x534e5f474f45524c49";

export const governanceContract = new Contract(
  GovernanceABI,
  GOVERNANCE_ADDRESS,
  provider
);

export const impLossContract = new Contract(
  ImpLossABI,
  IMP_LOSS_ADDRESS,
  provider
);
