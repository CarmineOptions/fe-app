import { useAccount } from "@starknet-react/core";

import { LoadingAnimation } from "../Loading/Loading";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { useNonSettledOptions } from "../../hooks/useNonSettledOptions";
import { NonSettledOption, OptionSideLong } from "@carmine-options/sdk/core";
import { timestampToDateAndTime } from "../../utils/utils";
import { Button, P3 } from "../common";
import { useState } from "react";
import { afterTransaction } from "../../utils/blockchain";
import { AccountInterface } from "starknet";
import toast from "react-hot-toast";

type CheckMap = { [key: string]: boolean };
type SetCheckMap = (cm: CheckMap) => void;

const SingleNonSettledOption = ({
  opt,
  user,
  checkMap,
  setCheckMap,
}: {
  opt: NonSettledOption;
  user: string;
  checkMap: CheckMap;
  setCheckMap: SetCheckMap;
}) => {
  const [maturityDate] = timestampToDateAndTime(opt.maturity * 1000);
  const [size, setSize] = useState(opt.size);
  const [fetching, setFetching] = useState(false);

  if (!fetching) {
    opt.fetchSizeWithCallback(user).then((res) => {
      setSize(res);
      opt.size = res;
    });
    setFetching(true);
  }

  const readableSize =
    size === undefined ? undefined : opt.base.toHumanReadable(size);
  const id = `opt-${opt.optionAddress}`;

  return (
    <div className="flex gap-4 justify-between">
      <div>
        <input
          type="checkbox"
          name={id}
          checked={checkMap[opt.optionAddress]}
          onClick={() => {
            const updated: CheckMap = { ...checkMap };
            updated[opt.optionAddress] = !checkMap[opt.optionAddress];
            setCheckMap(updated);
          }}
          disabled={opt.size === undefined}
        />
      </div>
      <div>{opt.poolId.toLocaleUpperCase()}</div>
      <div>{opt.optionSide === OptionSideLong ? "Long" : "Short"}</div>
      <div>{maturityDate}</div>
      <div>
        {opt.quote.symbol} {opt.strikePrice.val}
      </div>
      <div>{size ? readableSize : "--"}</div>
    </div>
  );
};

const handleSettleBundle = async (
  opts: NonSettledOption[],
  account: AccountInterface,
  setProgress: (n: number) => void,
) => {
  if (opts.length === 0) {
    toast("Select which options you want to settle");
    return;
  }
  if (opts.length > 10) {
    toast("Do not settle more than 10 options at once");
    return;
  }

  setProgress(1);

  console.log(
    "settling...",
    opts.map((o) => o.tradeSettle()),
  );

  const calls = opts
    .map((o) => o.tradeSettle())
    .filter((m) => m.isSome)
    .map((m) => m.unwrap());

  console.log("non settled calls", calls);

  const tx = await account.execute(calls).catch((e) => {
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

const NonSettledOptions = ({
  options,
  account,
  user,
}: {
  options: NonSettledOption[];
  account: AccountInterface;
  user: string;
}) => {
  const [progress, setProgress] = useState(0);
  const defaultCheckMap = options.reduce((acc, cur) => {
    const updated = { ...acc };
    updated[cur.optionAddress] = false;
    return updated;
  }, {} as CheckMap);
  const [checked, setChecked] = useState<CheckMap>(defaultCheckMap);

  const selected = options.filter((o) => checked[o.optionAddress]);

  return (
    <div className="max-w-[570px] flex flex-col gap-5">
      <div className="flex flex-col gap-3 overflow-x-auto">
        {options.map((o, i) => (
          <SingleNonSettledOption
            opt={o}
            user={user}
            checkMap={checked}
            setCheckMap={setChecked}
            key={i}
          />
        ))}
      </div>
      <div className="w-full flex justify-center">
        {progress === 0 && (
          <Button
            type="primary"
            onClick={() => handleSettleBundle(selected, account, setProgress)}
          >
            Settle selected options
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
            onClick={() => handleSettleBundle(selected, account, setProgress)}
          >
            Failed
          </Button>
        )}
        {progress === 3 && (
          <Button
            type="success"
            onClick={() => handleSettleBundle(selected, account, setProgress)}
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
  const { account } = useAccount();

  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }

  if (isError || !data || !account) {
    return (
      <div>
        <span>Something went wrong</span>
      </div>
    );
  }

  const nonZeroData = data.filter((o) => o.size !== 0n);

  if (nonZeroData.length === 0) {
    return (
      <div>
        <P3>No options to settle.</P3>
      </div>
    );
  }

  return (
    <div>
      <P3>
        Select which options to settle, do not settle more than 10 at once.
      </P3>
      <NonSettledOptions user={user} account={account} options={nonZeroData} />
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
