import { useAccount } from "@starknet-react/core";
import { useLiquidityEvents } from "../../hooks/useEvents";
import { useState } from "react";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { LoadingAnimation } from "../Loading/Loading";
import { MaturityStacked, P3, P4 } from "../common";
import { LiquidityEvent } from "@carmine-options/sdk/api";
import { formatNumber } from "../../utils/utils";
import { PairNameAboveBadge } from "../TokenBadge";
import {
  liquidityPoolByLpAddress,
  OptionTypeCall,
} from "@carmine-options/sdk/core";
import { PaginationButtons } from "./PaginationButtons";

type Props = {
  user: string;
};

type ItemProps = {
  event: LiquidityEvent;
};

const LiquidityEventItem = ({ event }: ItemProps) => {
  const pool = liquidityPoolByLpAddress(event.lpAddress).unwrap();

  return (
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full">
        <PairNameAboveBadge tokenA={pool.base} tokenB={pool.quote} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">
          {pool.optionType === OptionTypeCall ? "CALL" : "PUT"}
        </P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={event.timestamp.getTime() / 1000} />
      </div>
      <div className="w-full">{formatNumber(event.capital, 4)}</div>
      <div className="w-full">{event.eventName}</div>
    </div>
  );
};

const LiquidityEventsWithUser = ({ user }: Props) => {
  const [page, setPage] = useState<number>(1);
  const pageSize = 10;
  const { isLoading, isError, data } = useLiquidityEvents(
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
          <P4 className="text-dark-secondary">PAIR</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">TYPE</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">TIME OF ACTION</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">SIZE</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">ACTION</P4>
        </div>
      </div>
      {data.data.map((e, i) => (
        <LiquidityEventItem key={i} event={e} />
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

export const LiquidityEvents = () => {
  const { address } = useAccount();

  if (!address) {
    return (
      <SecondaryConnectWallet msg="Connect your wallet to view your history." />
    );
  }

  return <LiquidityEventsWithUser user={address} />;
};
