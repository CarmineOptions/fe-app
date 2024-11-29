import { Tooltip } from "@mui/material";

import { useProposalVotes } from "../../hooks/useProposalVotes";
import { ProposalVotes } from "../../calls/getProposalVotes";
import { useTotalSupply } from "../../hooks/useTotalSupply";
import { VE_CRM_ADDRESS } from "../../constants/amm";
import { shortInteger } from "../../utils/computations";
import { formatNumber } from "../../utils/utils";
import { H5, P3 } from "../common";
import { VoteButtons } from "./Vote";

type Props = {
  id: number;
  balance?: bigint;
};

const VoteScore = ({
  proposalVotes,
  totalSupply,
}: {
  proposalVotes: ProposalVotes;
  totalSupply: number;
}) => {
  const { yay, nay } = proposalVotes;
  const notVotes = totalSupply - yay - nay;

  const yayPercentage = (yay / totalSupply) * 100;
  const nayPercentage = (nay / totalSupply) * 100;
  const notVotedPercentage = 100 - yayPercentage - nayPercentage;

  const formatVotes = (v: number) => formatNumber(Math.round(v));

  const VoteMessage = () => (
    <div className="p-2">
      <div className="flex justify-between gap-6">
        <P3 className="text-ui-successAccent font-semibold">
          Yay {formatNumber(yayPercentage)}%
        </P3>
        <P3 className="text-ui-successAccent font-semibold">
          {formatVotes(yay)} votes
        </P3>
      </div>
      <div className="flex justify-between gap-6">
        <P3 className="text-ui-errorAccent">
          Nay {formatNumber(nayPercentage)}%
        </P3>
        <P3 className="text-ui-errorAccent">{formatVotes(nay)} votes</P3>
      </div>
      <div className="flex justify-between gap-6">
        <P3 className="text-dark-primary">
          Abstained {formatNumber(notVotedPercentage)}%
        </P3>
        <P3 className="text-dark-primary">{formatVotes(notVotes)} votes.</P3>
      </div>
    </div>
  );

  return (
    <Tooltip title={<VoteMessage />}>
      <div className="h-2 w-full relative flex overflow-hidden rounded-md">
        <div
          className="h-full bg-ui-successBg"
          style={{ width: `${yayPercentage}%` }}
        />
        <div className="h-full bg-ui-neutralBg grow" />
        <div
          className="h-full bg-ui-errorBg"
          style={{ width: `${nayPercentage}%` }}
        />
      </div>
    </Tooltip>
  );
};

export const Proposal = ({ id, balance }: Props) => {
  const { data: votes } = useProposalVotes(id);
  const { data: totalSupplyRaw } = useTotalSupply(VE_CRM_ADDRESS);

  const totalSupply = totalSupplyRaw
    ? shortInteger(totalSupplyRaw, 18)
    : undefined;

  return (
    <div className="rounded-md bg-dark-card w-80 p-4 flex flex-col gap-6">
      <H5>#{id}</H5>
      {votes !== undefined && totalSupply !== undefined && (
        <VoteScore proposalVotes={votes} totalSupply={totalSupply} />
      )}
      <div>
        <VoteButtons id={id} balance={balance} />
      </div>
    </div>
  );
};
