import { useQuery } from "@tanstack/react-query";
import { NoContent } from "../TableNoContent";
import ProposalTable from "./ProposalTable";
import { fetchProposalsWithOpinions } from "../../calls/liveProposals";
import { LoadingAnimation } from "../Loading/Loading";
import { useAccount } from "@starknet-react/core";
import { useUserBalance } from "../../hooks/useUserBalance";
import { VE_CRM_ADDRESS } from "../../constants/amm";

export const Proposals = () => {
  const { account, address } = useAccount();
  const { data: balance } = useUserBalance(VE_CRM_ADDRESS);
  const {
    isLoading,
    isError,
    data: proposals,
  } = useQuery({
    queryKey: ["proposals-with-opinion", address],
    queryFn: async () => fetchProposalsWithOpinions(address!),
    enabled: !!address,
  });

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
