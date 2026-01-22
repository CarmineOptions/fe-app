import { useAccount } from "@starknet-react/core";

import { LoadingAnimation } from "../Loading/Loading";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { useNonSettledOptions } from "../../hooks/useNonSettledOptions";
import { NonSettledOption, OptionSideLong } from "@carmine-options/sdk/core";
import { timestampToDateAndTime } from "../../utils/utils";
import { Button } from "../common";
import { useState } from "react";
import { afterTransaction } from "../../utils/blockchain";
import { AccountInterface } from "starknet";

const SingleNonSettledOption = ({ opt }: { opt: NonSettledOption }) => {
  const [maturityDate] = timestampToDateAndTime(opt.maturity * 1000);
  return (
    <div className="flex gap-4">
      <div className="w-36">{opt.poolId.toLocaleUpperCase()}</div>
      <div className="w-20">
        {opt.optionSide === OptionSideLong ? "Long" : "Short"}
      </div>
      <div className="w-32">{maturityDate}</div>
      <div>
        {opt.quote.symbol} {opt.strikePrice.val}
      </div>
    </div>
  );
};

const handleSettleBundle = async (
  user: string,
  opts: NonSettledOption[],
  account: AccountInterface,
  setProgress: (n: number) => void,
) => {
  setProgress(1);
  const promises = opts.map((o) => o.tradeSettle(user));
  const calls = await Promise.all(promises).catch(() => null);

  if (calls === null) {
    setProgress(2);
    return;
  }

  console.log("non settled calls", calls);

  const tx = await account
    .execute(calls.filter((c) => c !== null))
    .catch((e) => {
      console.error("Failed sending tx:", e);
      return null;
    });

  console.log("non settled tx", tx);

  if (tx === null) {
    setProgress(2);
    return;
  }

  afterTransaction(
    tx.transaction_hash,
    () => setProgress(3),
    () => setProgress(2),
  );
};

const NonSettledChunk = ({
  chunk,
  user,
}: {
  chunk: NonSettledOption[];
  user: string;
}) => {
  const { account } = useAccount();
  const [progress, setProgress] = useState(0);

  if (!account) {
    return;
  }

  return (
    <div className="max-w-[525px] flex-col gap-5 border-[#414142] border-[1px] rounded p-4">
      {chunk.map((o, i) => (
        <SingleNonSettledOption opt={o} key={i} />
      ))}
      <div className="w-full flex justify-center pt-3">
        {progress === 0 && (
          <Button
            type="primary"
            onClick={() =>
              handleSettleBundle(user, chunk, account, setProgress)
            }
          >
            Settle option bundle
          </Button>
        )}
        {progress === 1 && (
          <Button
            type="primary"
            outlined
            disabled
            className="w-48"
            onClick={() => {}}
          >
            <LoadingAnimation size={20} />
          </Button>
        )}
        {progress === 2 && (
          <Button
            type="error"
            onClick={() =>
              handleSettleBundle(user, chunk, account, setProgress)
            }
          >
            Failed
          </Button>
        )}
        {progress === 3 && (
          <Button
            type="success"
            onClick={() =>
              handleSettleBundle(user, chunk, account, setProgress)
            }
          >
            Success
          </Button>
        )}
      </div>
    </div>
  );
};

const MyNonSettledOptionsWithUser = ({ user }: { user: string }) => {
  const { isLoading, isError, data } = useNonSettledOptions(user);

  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <span>Something went wrong</span>
      </div>
    );
  }

  const chunkSize = 10;
  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    chunks.push(chunk);
  }

  return (
    <div className="flex flex-col gap-3 overflow-x-auto">
      {chunks.map((ch, i) => (
        <NonSettledChunk user={user} chunk={ch} key={i} />
      ))}
    </div>
  );
};

export const MyNonSettledOptions = () => {
  const { address } = useAccount();

  if (!address) {
    return <SecondaryConnectWallet msg="Connect wallet to see your options." />;
  }

  return <MyNonSettledOptionsWithUser user={address} />;
};
