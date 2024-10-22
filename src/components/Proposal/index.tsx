import { useQuery } from "react-query";
import { NoContent } from "../TableNoContent";
import ProposalTable from "./ProposalTable";
import { queryProposalsWithOpinions } from "../../calls/liveProposals";
import { LoadingAnimation } from "../Loading/Loading";
import { useAccount } from "@starknet-react/core";
import { useUserBalance } from "../../hooks/useUserBalance";
import { VE_CRM_ADDRESS } from "../../constants/amm";

export const Proposals = () => {
  const { account } = useAccount();
  const balance = useUserBalance(VE_CRM_ADDRESS);
  const {
    isLoading,
    isError,
    data: proposals,
  } = useQuery(
    [`proposals-${account?.address}`, account?.address],
    queryProposalsWithOpinions
  );

  if (isError) {
    return <p>Something went wrong, please try again later.</p>;
  }

  if (isLoading || !proposals) {
    return <LoadingAnimation />;
  }

  const validProposals = proposals.filter((p) => p.propId !== 106);

  if (validProposals.length === 0) {
    return <NoContent text="No proposals are currently live" />;
  }

  return (
    <ProposalTable
      proposals={validProposals}
      account={account}
      balance={balance}
    />
  );
};
