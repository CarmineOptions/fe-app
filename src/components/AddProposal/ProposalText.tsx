import toast from "react-hot-toast";
import { timestampToReadableDateUtc } from "../../utils/utils";
import { ProposalOption } from "./AddProposal";
import { pools } from "./pools";
import { Button, H5 } from "../common";

export const ProposalText = ({
  proposalOptions,
}: {
  proposalOptions: ProposalOption[];
}) => {
  const nonDuplicates = proposalOptions.filter((o) => o.active !== false);
  const groupedByPool = nonDuplicates.reduce(
    (acc: { [key: string]: { [key: number]: ProposalOption[] } }, item) => {
      if (!acc[item.pool]) {
        acc[item.pool] = [];
      }
      if (!acc[item.pool][item.maturity]) {
        acc[item.pool][item.maturity] = [];
      }
      acc[item.pool][item.maturity].push(item);
      return acc;
    },
    {}
  );
  const poolIds = Object.keys(groupedByPool);
  const texts: string[] = ["This proposal adds the following options:", ""];

  poolIds.forEach((poolId) => {
    const pool = pools.find((p) => p.poolId === poolId);
    if (!pool) {
      throw Error("Failed to find pool");
    }
    const maturities = Object.keys(groupedByPool[poolId]);

    maturities.forEach((maturityStr) => {
      const maturity = parseInt(maturityStr);
      texts.push(
        `${pool.baseToken.symbol}/${pool.quoteToken.symbol} ${
          pool.typeAsText
        } options expiring on ${timestampToReadableDateUtc(maturity * 1000)}`
      );
      const opts = groupedByPool[poolId][maturity];

      opts.forEach((o) => {
        texts.push(`strike ${o.strike}, volatility ${o.volatility}%`);
      });
      texts.push("");
    });
  });

  const handleCopy = () => {
    const txt = texts.join("\n");
    navigator.clipboard
      .writeText(txt)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  return (
    <div className="mt-5 flex flex-col gap-5">
      <H5>Proposal text</H5>
      <Button type="secondary" className="h-8 w-fit" onClick={handleCopy}>
        Copy
      </Button>
      <div className="w-fit p-2 border-dark-primary border-2 rounded-md">
        {texts.map((t) => {
          if (t === "") {
            return <br />;
          }
          return <p>{t}</p>;
        })}
      </div>
    </div>
  );
};
