import { ETH_DIGITS } from "../../constants/amm";
import { IStake, ITrade, IVote } from "../../types/history";
import { shortInteger } from "../../utils/computations";
import { formatNumber } from "../../utils/utils";
import { useState } from "react";
import { PairNameAboveBadge } from "../TokenBadge";
import { Button, MaturityStacked, P3, P4, SideTypeStacked } from "../common";
import { poolNameToPoolMap } from "../../classes/Pool";

type TransactionsTableProps = {
  trades: ITrade[];
  stakes: IStake[];
  votes: IVote[];
};

type TradesTableProps = {
  trades: ITrade[];
};

type StakesTableProps = {
  stakes: IStake[];
};

type VotesTableProps = {
  votes: IVote[];
};

type SingleTradeProp = {
  trade: ITrade;
};

type SingleStakeProp = {
  stake: IStake;
};

type SingleVoteProp = {
  vote: IVote;
};

const SingleTrade = ({ trade }: SingleTradeProp) => {
  const { option, timestamp, action, tokens_minted } = trade;

  const size = shortInteger(
    BigInt(tokens_minted).toString(10),
    option.baseToken.decimals
  );

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[880px]">
      <div className="w-full">
        <PairNameAboveBadge
          tokenA={option.baseToken}
          tokenB={option.quoteToken}
        />
      </div>
      <div className="w-full">
        <SideTypeStacked side={option.side} type={option.type} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">{option.strikeWithCurrency}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={option.maturity} />
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={timestamp} />
      </div>
      <div className="w-full">{formatNumber(size, 4)}</div>
      <div className="w-full">{action}</div>
    </div>
  );
};

export const TradesTable = ({ trades }: TradesTableProps) => {
  const [expanded, setExpanded] = useState(false);

  if (trades.length === 0) {
    return <p>There are no trade events associated with this wallet.</p>;
  }

  const COLLAPSED_LENGTH = 5;

  const size = expanded ? trades.length : COLLAPSED_LENGTH;

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-[880px]">
        <div className="w-full">
          <P4 className="text-dark-secondary">PAIR</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">
            SIDE <span className="text-dark-primary">/ TYPE</span>
          </P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">STRIKE</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">MATURITY</P4>
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
      {trades.length === 0 ? (
        <div className="my-2 py-3 max-w-[880px]">
          <P3 className="font-semibold text-center">Nothing to show</P3>
        </div>
      ) : (
        trades
          .slice(0, size)
          .map((trade, i) => <SingleTrade trade={trade} key={i} />)
      )}
      {trades.length > COLLAPSED_LENGTH && (
        <div className="max-w-[880px] flex justify-center">
          <Button type="secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
};

const SingleStake = ({ stake }: SingleStakeProp) => {
  const { liquidity_pool, timestamp, action, tokens_minted } = stake;

  const pool = poolNameToPoolMap[liquidity_pool];

  if (!pool) {
    return null;
  }

  const size = shortInteger(BigInt(tokens_minted).toString(10), ETH_DIGITS);

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[880px]">
      <div className="w-full">
        <PairNameAboveBadge tokenA={pool.baseToken} tokenB={pool.quoteToken} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">{pool.typeAsText.toUpperCase()}</P3>{" "}
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={timestamp} />
      </div>
      <div className="w-full">{formatNumber(size, 4)}</div>
      <div className="w-full">{action}</div>
    </div>
  );
};

export const StakesTable = ({ stakes }: StakesTableProps) => {
  const [expanded, setExpanded] = useState(false);

  if (stakes.length === 0) {
    return <p>There are no liquidity events associated with this wallet.</p>;
  }

  const COLLAPSED_LENGTH = 5;

  const size = expanded ? stakes.length : COLLAPSED_LENGTH;

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-[880px]">
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
      {stakes.length === 0 ? (
        <div className="my-2 py-3 max-w-[880px]">
          <P3 className="font-semibold text-center">Nothing to show</P3>
        </div>
      ) : (
        stakes
          .slice(0, size)
          .map((stake, i) => <SingleStake stake={stake} key={i} />)
      )}
      {stakes.length > COLLAPSED_LENGTH && (
        <div className="max-w-[880px] flex justify-center">
          <Button type="secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
};

const SingleVote = ({ vote }: SingleVoteProp) => {
  const { timestamp, opinion, prop_id } = vote;

  const displayOpinion = opinion ? "YAY" : "NAY";

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[880px]">
      <div className="w-full">
        <P3 className="font-semibold">{prop_id}</P3>{" "}
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={timestamp} />
      </div>
      <div
        className={`w-full ${
          opinion ? "text-ui-successBg" : "text-ui-errorBg"
        }`}
      >
        {displayOpinion}
      </div>
    </div>
  );
};

export const VotesTable = ({ votes }: VotesTableProps) => {
  const [expanded, setExpanded] = useState(false);

  if (votes.length === 0) {
    return <p>There are no vote events associated with this wallet.</p>;
  }

  const COLLAPSED_LENGTH = 5;

  const size = expanded ? votes.length : COLLAPSED_LENGTH;

  return (
    <div className="flex flex-col gap-1 overflow-x-auto">
      <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-[880px]">
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
      {votes.length === 0 ? (
        <div className="my-2 py-3 max-w-[880px]">
          <P3 className="font-semibold text-center">Nothing to show</P3>
        </div>
      ) : (
        votes
          .slice(0, size)
          .map((vote, i) => <SingleVote vote={vote} key={i} />)
      )}
      {votes.length > COLLAPSED_LENGTH && (
        <div className="max-w-[880px] flex justify-center">
          <Button type="secondary" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show less" : "Show more"}
          </Button>
        </div>
      )}
    </div>
  );
};

export const TransactionsTable = ({
  trades,
  stakes,
  votes,
}: TransactionsTableProps) => {
  return (
    <div className="mb-20">
      <h1 style={{ marginTop: "40px" }}>Trade History</h1>
      <TradesTable trades={trades} />
      <h1 style={{ marginTop: "40px" }}>Liquidity History</h1>
      <StakesTable stakes={stakes} />
      <h1 style={{ marginTop: "40px" }}>Vote History</h1>
      <VotesTable votes={votes} />
    </div>
  );
};
