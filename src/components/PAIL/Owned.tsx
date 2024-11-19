import { LoadingAnimation } from "../Loading/Loading";
import { usePailTokenIds } from "../../hooks/usePailTokenIds";
import { useProvider, useSendTransaction } from "@starknet-react/core";
import { PAIL_ADDRESS, PAIL_NFT_ADDRESS } from "../../constants/amm";
import toast from "react-hot-toast";

export const Owned = () => {
  const { isLoading, isError, error, data } = usePailTokenIds();
  const { sendAsync } = useSendTransaction({});
  const { provider } = useProvider();

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
    <div style={{ display: "flex", flexFlow: "column" }}>
      <h3>Live</h3>
      {data.live.length === 0 ? (
        <p>No live PAIL</p>
      ) : (
        data.live.map((id, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            <p>token id {id}</p>
            <button
              onClick={() => handleFinalise(id, "hedge_close")}
              className="main active primary"
            >
              Close
            </button>
          </div>
        ))
      )}
      <h3>Expired</h3>
      {data.expired.length === 0 ? (
        <p>No expired PAIL</p>
      ) : (
        data.expired.map((id, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            <p>token id {id}</p>
            <button
              onClick={() => handleFinalise(id, "hedge_settle")}
              className="main active primary"
            >
              Settle
            </button>
          </div>
        ))
      )}
    </div>
  );
};
