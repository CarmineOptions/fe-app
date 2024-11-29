import { useState } from "react";

import { CarmineStake } from "../../classes/CarmineStake";
import { shortInteger } from "../../utils/computations";
import { StakingModal } from "./StakingModal";
import { UnstakeModal } from "./UnstakeModal";
import { Button, H5, MaturityStacked, P3, P4 } from "../common";
import { formatNumber } from "../../utils/utils";

type Props = {
  stakes: CarmineStake[];
  veBalance: bigint;
};

export const Stakes = ({ stakes, veBalance }: Props) => {
  const [open, setOpen] = useState(false);
  const [unstakeOpen, setUnstakeOpen] = useState(false);
  const balanceInStakes = stakes.reduce((acc, cur) => {
    if (cur.isNotWithdrawn) {
      return acc + cur.amountVotingToken;
    }
    return acc;
  }, 0n);

  const active = stakes.filter((s) => s.isActive);
  const expired = stakes.filter((s) => s.isExpired);

  const initialVeCarm = veBalance - balanceInStakes;

  const Header = ({ isActive }: { isActive: boolean }) => {
    return (
      <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-big">
        <div className="w-full">
          <P4 className="text-dark-secondary">START</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">END</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">PERIOD</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">AMOUNT</P4>
        </div>
        <div className="w-full">
          <P4 className="text-dark-secondary">VOTING POWER</P4>
        </div>
        {!isActive && <div className="w-full" />}
      </div>
    );
  };

  const InitialVeCarmItem = ({
    amount,
    amountHumanReadable,
  }: {
    amount: bigint;
    amountHumanReadable: number;
  }) => {
    return (
      <div className="flex justify-between my-2 py-3 text-left w-big">
        <div className="w-full">
          <P3 className="font-semibold">--</P3>
        </div>
        <div className="w-full">
          <P3 className="font-semibold">--</P3>
        </div>
        <div className="w-full">
          <P3 className="font-semibold">--</P3>
        </div>
        <div className="w-full">
          <P3 className="font-semibold">
            {formatNumber(amountHumanReadable, amountHumanReadable < 0 ? 5 : 2)}
          </P3>
        </div>
        <div className="w-full">
          <P3 className="font-semibold">0</P3>
        </div>
        <div className="w-full">
          <Button type="primary" className="h-8" onClick={() => setOpen(true)}>
            Unstake
          </Button>
        </div>
        <StakingModal amount={amount} open={open} setOpen={setOpen} />
      </div>
    );
  };

  const Item = ({
    stake,
    isActive,
  }: {
    stake: CarmineStake;
    isActive: boolean;
  }) => {
    return (
      <div className="flex justify-between my-2 py-3 text-left w-big">
        <div className="w-full">
          <MaturityStacked timestamp={stake.start} />
        </div>
        <div className="w-full">
          <MaturityStacked timestamp={stake.end} />
        </div>
        <div className="w-full">
          <P3 className="font-semibold">{stake.period}</P3>
        </div>
        <div className="w-full">
          <P3 className="font-semibold">
            {formatNumber(
              stake.amountStakedHumanReadable,
              stake.amountStakedHumanReadable < 0 ? 5 : 2
            )}
          </P3>
        </div>
        <div className="w-full">
          <P3 className="font-semibold">
            {formatNumber(
              stake.amountVotingTokenHumanReadable,
              stake.amountVotingTokenHumanReadable < 0 ? 5 : 2
            )}
          </P3>
        </div>
        {!isActive && (
          <div className="w-full">
            <Button
              type="primary"
              className="h-8"
              onClick={() => setOpen(true)}
            >
              Restake & Unstake
            </Button>
            <UnstakeModal
              stake={stake}
              open={unstakeOpen}
              setOpen={setUnstakeOpen}
            />
          </div>
        )}
      </div>
    );
  };

  const showExpired = expired.length > 0 || initialVeCarm > 0n;

  return (
    <div className="flex flex-col gap-8">
      {showExpired && <H5>Expired stakes</H5>}
      {showExpired && (
        <div className="flex flex-col gap-3 overflow-x-auto">
          <Header isActive={false} />
          {initialVeCarm > 0n && (
            <InitialVeCarmItem
              amount={initialVeCarm}
              amountHumanReadable={shortInteger(initialVeCarm, 18)}
            />
          )}
          {expired.map((stake, i) => (
            <Item isActive={false} stake={stake} key={i} />
          ))}
        </div>
      )}
      <H5>Active stakes</H5>
      <div className="flex flex-col gap-3 overflow-x-auto">
        <Header isActive />
        {active.length === 0 ? (
          <div className="my-2 py-3 max-w-big">
            <P3 className="font-semibold text-center">Nothing to show</P3>
          </div>
        ) : (
          active.map((stake, i) => <Item isActive stake={stake} key={i} />)
        )}
      </div>
    </div>
  );
};
