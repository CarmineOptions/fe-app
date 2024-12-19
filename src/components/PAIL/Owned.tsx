import { LoadingAnimation } from "../Loading/Loading";
import { usePailTokenIds } from "../../hooks/usePailTokenIds";
import {
  useAccount,
  useProvider,
  useSendTransaction,
} from "@starknet-react/core";
import { PAIL_ADDRESS, PAIL_NFT_ADDRESS } from "../../constants/amm";
import toast from "react-hot-toast";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { Button, Divider, H5, MaturityStacked, P3, P4 } from "../common";
import { usePailTokenInfo } from "../../hooks/usePailInfo";
import { Token } from "../../classes/Token";
import { PairNameAboveBadge } from "../TokenBadge";

const PailItem = ({
  id,
  handleClick,
}: {
  id: number;
  handleClick: (
    tokenId: number,
    funcName: "hedge_close" | "hedge_settle"
  ) => void;
}) => {
  const { isLoading, isError, data } = usePailTokenInfo(id);

  if (isLoading) {
    return <P4>Loading...</P4>;
  }
  if (isError || !data) {
    return <P4>Error</P4>;
  }

  const base = Token.byAddress(data.base);
  const quote = Token.byAddress(data.quote);
  const maturity = Number(data.maturity);

  const isExpired = maturity * 1000 < Date.now();
  const funcName = isExpired ? "hedge_settle" : "hedge_close";

  return (
    <div className="flex justify-between my-2 py-3 text-left w-[400px]">
      <div className="w-full">
        <PairNameAboveBadge tokenA={base} tokenB={quote} />
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
  const { isLoading, isError, error, data } = usePailTokenIds();
  const { sendAsync } = useSendTransaction({});
  const { provider } = useProvider();

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

  return (
    <div className="flex flex-col">
      <H5>Live</H5>
      <div className="overflow-x-auto">
        <div className="flex flex-col g-3 w-[400px]">
          <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-[400px]">
            <div className="w-full">
              <P4 className="text-dark-secondary">PAIR</P4>
            </div>
            <div className="w-full">
              <P4 className="text-dark-secondary">MATURITY</P4>
            </div>
            {/* Empty room for button */}
            <div className="w-full" />
          </div>
          {data?.live?.length === 0 ? (
            <div className="my-2 py-3 max-w-big">
              <P3 className="font-semibold text-center">Nothing to show</P3>
            </div>
          ) : (
            data?.live?.map((id, i) => (
              <PailItem key={i} id={id} handleClick={handleFinalise} />
            ))
          )}
        </div>
      </div>

      <Divider className="my-8" />

      <H5>Expired</H5>
      <div className="overflow-x-auto">
        <div className="flex flex-col g-3 w-[400px]">
          <div className="flex justify-between my-2 py-3 border-dark-tertiary border-y-[0.5px] text-left w-[400px]">
            <div className="w-full">
              <P4 className="text-dark-secondary">PAIR</P4>
            </div>
            <div className="w-full">
              <P4 className="text-dark-secondary">MATURITY</P4>
            </div>
            {/* Empty room for button */}
            <div className="w-full" />
          </div>
          {data?.expired?.length === 0 ? (
            <div className="my-2 py-3 max-w-big">
              <P3 className="font-semibold text-center">Nothing to show</P3>
            </div>
          ) : (
            data?.expired?.map((id, i) => (
              <PailItem key={i} id={id} handleClick={handleFinalise} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
