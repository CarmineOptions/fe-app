import { useNavigate } from "react-router-dom";
import { closeSidebar } from "../../redux/actions";
import { Button, H6, P3, P4 } from "../common";
import { PairNamedBadgeDark } from "../TokenBadge";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber } from "../../utils/utils";
import { OptionWithPremia } from "@carmine-options/sdk/core";
import { useTokenPrice } from "../../hooks/usePrice";

interface OptionSidebarSuccessProps {
  option: OptionWithPremia;
  size: number;
  tx: string;
}

export const OptionSidebarSuccess = ({
  option,
  size,
  tx,
}: OptionSidebarSuccessProps) => {
  const navigate = useNavigate();
  const price = useTokenPrice(option.underlying.symbol);

  const handlePortfolioClick = () => {
    navigate("/portfolio");
    closeSidebar();
  };

  return (
    <OptionSidebarSuccessView
      option={option}
      size={size}
      amount={option.premia.val}
      amountUsd={price === undefined ? undefined : option.premia.val * price}
      tx={tx}
      handlePortfolioClick={handlePortfolioClick}
    />
  );
};

interface OptionSidebarSuccessViewProps extends OptionSidebarSuccessProps {
  handlePortfolioClick: () => void;
  amount: number;
  amountUsd: number | undefined;
}

export const OptionSidebarSuccessView = ({
  option,
  size,
  amount,
  amountUsd,
  tx,
  handlePortfolioClick,
}: OptionSidebarSuccessViewProps) => {
  return (
    <div className="flex flex-col bg-brand text-dark py-20 px-5 gap-6 h-full">
      <h3 className="text-[48px] text-black font-bold">SUCCESSFUL</h3>
      <div className="flex flex-col gap-1">
        <PairNamedBadgeDark tokenA={option.base} tokenB={option.quote} />
        <div
          className={`${
            option.isLong
              ? "text-ui-successAccent bg-ui-successBg"
              : "text-ui-errorAccent bg-ui-errorBg"
          } rounded-sm w-fit uppercase px-3 py-[2px]`}
        >
          <P3 className="font-semibold">
            {option.optionSide === 0 ? "Short" : "Long"}
          </P3>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <P3 className="font-semibold">Option Size</P3>
          <P4 className="text-dark-tertiary">Notional vol.</P4>
        </div>
        <div>
          <H6>{size}</H6>
        </div>
      </div>

      <div className="flex justify-between">
        <div>
          <P3 className="font-semibold">Amount</P3>
        </div>
        <div>
          {amountUsd === undefined ? (
            <div className="h-[40.5px] w-[40.5px]">
              <LoadingAnimation size={25} />
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <P3 className="font-semibold">
                {`${formatNumber(amount, 4)} ${option.underlying.symbol}`}
              </P3>
              <P4 className="text-dark-tertiary font-bold">{`$${formatNumber(
                amountUsd,
                4
              )}`}</P4>
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
