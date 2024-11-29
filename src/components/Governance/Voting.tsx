import { useQuery } from "@tanstack/react-query";
import { NoContent } from "../TableNoContent";
import { fetchLiveProposals } from "../../calls/liveProposals";
import { LoadingAnimation } from "../Loading/Loading";
import { useAccount } from "@starknet-react/core";
import { useUserBalance } from "../../hooks/useUserBalance";
import { VE_CRM_ADDRESS } from "../../constants/amm";
import { Proposal } from "./Proposal";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { P3 } from "../common";

export const Voting = () => {
  const { address } = useAccount();
  const { isLoading: balanceLoading, data: balance } =
    useUserBalance(VE_CRM_ADDRESS);
  const {
    isLoading,
    isError,
    data: proposals,
  } = useQuery({
    queryKey: ["proposals-with-opinion", address],
    queryFn: async () => fetchLiveProposals(),
  });

  if (isError) {
    return <p>Something went wrong, please try again later.</p>;
  }

  if (isLoading || !proposals) {
    return <LoadingAnimation />;
  }

  // in case of a wrong proposal, add it to the list and it won't show on the FE
  const brokenProposals = [106];
  const validProposals = proposals.filter((p) => !brokenProposals.includes(p));

  if (validProposals.length === 0) {
    return <NoContent text="No proposals are currently live" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {!address && (
        <SecondaryConnectWallet msg="Connect wallet to be able to vote." />
      )}
      {!!address && !balanceLoading && !balance && (
        <P3>
          Only <span className="font-bold">veCRM</span> token holders can vote.
        </P3>
      )}
      <div className="flex flex-wrap gap-5">
        {proposals.map((propId, i) => (
          <Proposal id={propId} balance={balance} key={i} />
        ))}
      </div>
    </div>
  );
};
