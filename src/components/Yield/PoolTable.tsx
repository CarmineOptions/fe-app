import { PoolItem } from "./PoolItem";
import { pools } from "../AddProposal/pools";
import { L2, P4 } from "../common";

export const PoolTable = () => {
  return (
    <div className="w-ful overflow-x-auto mt-5">
      <div className="flex flex-col text-left gap-5 min-w-big overflow-hidden">
        <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-big">
          <div className="w-full">
            <P4 className="text-dark-secondary">POOL</P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">TYPE</P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">
              APY <L2 className="text-dark-tertiary">/ ALL TIME</L2>
            </P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">
              APY <L2 className="text-dark-tertiary">/ LAST WEEK</L2>
            </P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">TVL</P4>
          </div>
          <div className="w-full">
            <P4 className="text-dark-secondary">MY DEPOSIT</P4>
          </div>
          {/* Empty room for button */}
          <div className="w-full" />
        </div>
        {pools.map((pool, i) => (
          <PoolItem key={i} pool={pool} />
        ))}
      </div>
    </div>
  );
};
