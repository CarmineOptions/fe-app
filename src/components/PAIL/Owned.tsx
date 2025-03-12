import { LoadingAnimation } from "../Loading/Loading";
import { PailTokenDesc, usePailTokens } from "../../hooks/usePailTokenIds";
import {
  useAccount,
  useProvider,
  useSendTransaction,
} from "@starknet-react/core";
import { PAIL_ADDRESS, PAIL_NFT_ADDRESS } from "../../constants/amm";
import toast from "react-hot-toast";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { Button, H4, MaturityStacked, P3 } from "../common";
import { PairNameAboveBadge } from "../TokenBadge";
import { useState } from "react";
import { Token } from "../../classes/Token";

type PailItemProps = {
  pail: PailTokenDesc;
  handleClick: (
    tokenId: number,
    funcName: "hedge_close" | "hedge_settle"
  ) => void;
};

const PailItem = ({ pail, handleClick }: PailItemProps) => {
  const { base, quote, maturity, id } = pail;

  const baseToken = Token.byAddress(base);
  const quoteToken = Token.byAddress(quote);

  const isExpired = maturity * 1000 < Date.now();
  const funcName = isExpired ? "hedge_settle" : "hedge_close";

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[400px]">
      <div className="w-full">
        <PairNameAboveBadge tokenA={baseToken} tokenB={quoteToken} />
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={maturity} />
      </div>
      <div className="w-full">
        <Button
          type="primary"
          className="w-full"
          onClick={() => handleClick(id, funcName)}
        >
          {isExpired ? "Settle" : "Close"}
        </Button>
      </div>
    </div>
  );
};

export const Owned = () => {
  const { address } = useAccount();
  const { isLoading, isError, error, data } = usePailTokens();
  const { sendAsync } = useSendTransaction({});
  const { provider } = useProvider();
  const [state, setState] = useState<"live" | "expired">("live");

  if (!address) {
    return (
      <SecondaryConnectWallet msg="Connect wallet to see your positions." />
    );
  }

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    console.error(error);
    return <p>Something went wrong</p>;
  }

  const handleFinalise = async (
    tokenId: number,
    funcName: "hedge_close" | "hedge_settle"
  ) => {
    await sendAsync([
      {
        contractAddress: PAIL_NFT_ADDRESS,
        entrypoint: "setApprovalForAll",
        calldata: [PAIL_ADDRESS, true],
      },
      {
        contractAddress: PAIL_ADDRESS,
        entrypoint: funcName,
        calldata: [tokenId, 0],
      },
    ])
      .then(({ transaction_hash }) => {
        toast.promise(provider.waitForTransaction(transaction_hash), {
          loading: `Waiting for ${funcName} tx to finish...`,
          success: `${funcName} successful!`,
          error: `${funcName} failed!`,
        });
      })
      .catch(() => {
        toast.error(`Failed ${funcName} PAIL position`);
      });
  };

  const now = new Date().getTime() / 1000;

  const hedges =
    state === "live"
      ? data.filter((hedge) => hedge.maturity > now)
      : data.filter((hedge) => hedge.maturity <= now);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center gap-7 mb-6">
        <H4>Hedges</H4>
        <div className="flex gap-1">
          <div>
            <Button
              type={state === "live" ? "primary" : "secondary"}
              outlined={state !== "live"}
              onClick={() => setState("live")}
            >
              live
            </Button>
          </div>
          <div>
            <Button
              type={state === "expired" ? "primary" : "secondary"}
              outlined={state !== "expired"}
              onClick={() => setState("expired")}
            >
              expired
            </Button>
          </div>
        </div>
      </div>
      {hedges.length === 0 ? (
        <P3>Nothing to show</P3>
      ) : (
        <div>
          {hedges.map((pail, i) => (
            <PailItem pail={pail} handleClick={handleFinalise} key={i} />
          ))}
        </div>
      )}
    </div>
  );
};
