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
import { Button, H5 } from "../common";

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
      {data?.live?.length === 0 ? (
        <p>No live PAIL</p>
      ) : (
        data.live.map((id, i) => (
          <div key={i} className="flex items-center gap-4">
            <p>token id {id}</p>
            <Button
              type="primary"
              onClick={() => handleFinalise(id, "hedge_close")}
            >
              Close
            </Button>
          </div>
        ))
      )}
      <H5>Expired</H5>
      {data?.expired?.length === 0 ? (
        <p>No expired PAIL</p>
      ) : (
        data.expired.map((id, i) => (
          <div key={i} className="flex items-center gap-4">
            <p>token id {id}</p>
            <Button
              onClick={() => handleFinalise(id, "hedge_settle")}
              type="primary"
            >
              Settle
            </Button>
          </div>
        ))
      )}
    </div>
  );
};
