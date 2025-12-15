import { useAccount } from "@starknet-react/core";
import { useVoteEvents } from "../../hooks/useEvents";
import { useState } from "react";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { LoadingAnimation } from "../Loading/Loading";
import { MaturityStacked, P3, P4 } from "../common";
import { VoteEvent } from "@carmine-options/sdk/api";
import { PaginationButtons } from "./PaginationButtons";

type Props = {
  user: string;
};

type ItemProps = {
  event: VoteEvent;
};

const VoteEventItem = ({ event }: ItemProps) => {
  const displayOpinion = event.opinion ? "YAY" : "NAY";
  return (
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full">
        <P3 className="font-semibold">{event.propId}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={event.timestamp.getTime() / 1000} />
      </div>
      <div
        className={`w-full ${
          event.opinion ? "text-ui-successBg" : "text-ui-errorBg"
        }`}
      >
        {displayOpinion}
      </div>
    </div>
  );
};

const VoteEventsWithUser = ({ user }: Props) => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const { isLoading, isError, data } = useVoteEvents(
    user,
    pageSize,
    (page - 1) * pageSize
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <P3>Something went wrong</P3>;
  }

  if (!data.data) {
    return <P3>No data</P3>;
  }

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-big">
        <div className="w-full">
          <P4 className="text-dark-secondary">PROPOSAL ID</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">TIME OF VOTE</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">OPINION</P4>
        </div>
      </div>
      {data.data.map((e, i) => (
        <VoteEventItem key={i} event={e} />
      ))}
      <PaginationButtons
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        total={data.total}
      />
    </div>
  );
};

export const VoteEvents = () => {
  const { address } = useAccount();

  if (!address) {
    return (
      <SecondaryConnectWallet msg="Connect your wallet to view your history." />
    );
  }

  return <VoteEventsWithUser user={address} />;
};
