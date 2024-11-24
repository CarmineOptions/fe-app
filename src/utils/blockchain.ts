import { Contract } from "starknet";
import AmmAbi from "../abi/amm_abi.json";
import GovernanceAbi from "../abi/governance_abi.json";
import { AMM_ADDRESS, GOVERNANCE_ADDRESS } from "../constants/amm";
import { provider } from "../network/provider";

export const AMMContract = new Contract(AmmAbi, AMM_ADDRESS, provider);

export const GovernanceContract = new Contract(
  GovernanceAbi,
  GOVERNANCE_ADDRESS,
  provider
);

export const afterTransaction = (
  tx: string,
  ok: () => void,
  nok?: () => void
) => {
  provider.waitForTransaction(tx).then(ok).catch(nok);
};
