import { useAccount } from "@starknet-react/core";

import { LoadingAnimation } from "../Loading/Loading";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { useNonSettledOptions } from "../../hooks/useNonSettledOptions";
import { NonSettledOption } from "@carmine-options/sdk/core";
import { Button, MaturityStacked, P3, P4, SideTypeStacked } from "../common";
import { useState } from "react";
import { afterTransaction } from "../../utils/blockchain";
import { AccountInterface } from "starknet";
import toast from "react-hot-toast";
import { PairNameAboveBadge } from "../TokenBadge";

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
    <div className="flex justify-between my-2 py-3 text-left w-big">
      <div className="w-full flex justify-center">
        <input
          type="checkbox"
          name={id}
          checked={checkMap[opt.optionAddress]}
          onClick={() => {
            const updated: CheckMap = { ...checkMap };
            updated[opt.optionAddress] = !checkMap[opt.optionAddress];
            setCheckMap(updated);
          }}
          disabled={size === undefined}
        />
      </div>
      <div className="w-full">
        <PairNameAboveBadge tokenA={opt.base} tokenB={opt.quote} />
      </div>
      <div className="w-full">
        <SideTypeStacked side={opt.optionSide} type={opt.optionType} />
      </div>
      <div className="w-full">
        <P3 className="font-semibold">
          {opt.underlying.symbol} {opt.strikePrice.val}
        </P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={opt.maturity} />
      </div>
      <div className="w-full">{size ? readableSize : "--"}</div>
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
    <div className="flex flex-col gap-5">
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
      <div>
        <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-big">
          {/* Empty for checkbox */}
          <div className="w-full" />
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
            <P4 className="text-dark-secondary">SIZE</P4>
          </div>
        </div>
      </div>
      <NonSettledOptions user={user} account={account} options={nonZeroData} />
    </div>
  );
};

export const MyNonSettledOptions = () => {
  const { address } = useAccount();

  if (!address) {
    return <SecondaryConnectWallet msg="Connect wallet to see your options." />;
  }

  return (
    <MyNonSettledOptionsWithUser
      user={"0x11d341c6e841426448ff39aa443a6dbb428914e05ba2259463c18308b86233"}
    />
  );
};
