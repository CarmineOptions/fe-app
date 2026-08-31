import { PairNamedBadgeDark } from "../TokenBadge";
import { useNavigate } from "react-router-dom";
import { closeSidebar } from "../../redux/actions";
import { useStakes } from "../../hooks/useStakes";
import { formatNumber } from "../../utils/utils";
import { Button, H4, P3, P4 } from "../common";
import { LoadingAnimation } from "../Loading/Loading";
import { LiquidityPool, OptionTypeCall } from "@carmine-options/sdk/core";

interface PoolSucessSidebarProps {
  pool: LiquidityPool;
  deposited: number;
  tx: string;
}

export const PoolSidebarSuccess = ({
  pool,
  deposited,
  tx,
}: PoolSucessSidebarProps) => {
  const { data: stakes } = useStakes();
  const navigate = useNavigate();

  const handlePortfolioClick = () => {
    navigate("/portfolio");
    closeSidebar();
  };

  const poolData =
    stakes === undefined
      ? undefined
      : stakes.find((p) => p.lpAddress === pool.lpAddress);

  const currentPosition =
    stakes === undefined
      ? undefined
      : poolData === undefined // got data and found nothing about this pool
      ? 0
      : poolData.value;

  return (
    <PoolSidebarSuccessView
      deposited={deposited}
      currentPosition={currentPosition}
      handlePortfolioClick={handlePortfolioClick}
      pool={pool}
      tx={tx}
    />
  );
};

interface PoolSucessSidebarViewProps extends PoolSucessSidebarProps {
  deposited: number;
  currentPosition?: number;
  handlePortfolioClick: () => void;
}

export const PoolSidebarSuccessView = ({
  pool,
  deposited,
  currentPosition,
  tx,
  handlePortfolioClick,
}: PoolSucessSidebarViewProps) => {
  return (
    <div className="flex flex-col bg-brand text-dark py-20 px-5 gap-6 h-full">
      <h3 className="text-[48px] text-black font-bold">SUCCESSFUL</h3>
      <div className="flex flex-col gap-1">
        <PairNamedBadgeDark tokenA={pool.base} tokenB={pool.quote} />
        <H4>{pool.optionType === OptionTypeCall ? "Call" : "Put"} Pool</H4>
      </div>

      <div className="flex justify-between">
        <div>
          <P3 className="font-semibold">Deposited</P3>
        </div>
        <div>
          <div className="flex flex-col items-end">
            <P3 className="font-semibold">
              {`${formatNumber(deposited, 4)} ${pool.underlying.symbol}`}
            </P3>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <P3 className="font-semibold">Deposited</P3>
        </div>
        <div>
          {currentPosition === undefined ? (
            <div className="h-[40.5px] w-[40.5px]">
              <LoadingAnimation size={25} />
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <P3 className="font-semibold">
                {`${formatNumber(currentPosition, 4)} ${
                  pool.underlying.symbol
                }`}
              </P3>
            </div>
          )}
        </div>
      </div>

      <div>
        <Button
          type="dark"
          className="w-full h-8 normal-case"
          onClick={handlePortfolioClick}
        >
          View Portfolio
        </Button>
      </div>
      <div className="text-center">
        <P4>
          <a
            href={`https://starkscan.co/tx/${tx}`}
            target="_blank"
            rel="noreferrer"
          >
            View Transaction ↗
          </a>
        </P4>
      </div>
    </div>
  );
};
