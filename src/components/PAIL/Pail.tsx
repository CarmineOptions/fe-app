import { useState } from "react";
import { Pair, PairKey } from "../../classes/Pair";
import { useOptions } from "../../hooks/useOptions";
import { LoadingAnimation } from "../Loading/Loading";
import { TokenPairSelect } from "../TokenPairSelect";
import { Button, Divider } from "../common";
import { PailConcentrated } from "./PailConcentrated";
import { PailNonConcentrated } from "./PailNonConcentrated";

export const Pail = () => {
  const { isLoading, isError, options } = useOptions();
  const [pair, setPair] = useState<Pair>(Pair.pairByKey(PairKey.STRK_USDC));
  const [isConcentrated, setIsConcentrated] = useState(false);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !options) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="flex flex-col gap-5 justify-between">
      <div className="w-fit">
        <TokenPairSelect pair={pair} setPair={setPair} />
      </div>
      <Divider />

      <div className="p-1 flex items-center gap-2">
        <Button
          type="secondary"
          outlined={isConcentrated}
          onClick={() => setIsConcentrated(false)}
        >
          AMM
        </Button>
        <Divider className="w-10" />
        <Button
          type="secondary"
          outlined={!isConcentrated}
          onClick={() => setIsConcentrated(true)}
        >
          CAMM
        </Button>
      </div>
      <div>
        {isConcentrated ? (
          <PailConcentrated pair={pair} options={options} />
        ) : (
          <PailNonConcentrated pair={pair} options={options} />
        )}
      </div>
    </div>
  );
};
