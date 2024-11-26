import { useState } from "react";
import { AccountInterface } from "starknet";
import { getDefiSpringData } from "./fetch";
import { shortInteger } from "../../utils/computations";
import { Skeleton } from "@mui/material";
import { addressElision } from "../../utils/utils";
import { addTx, markTxAsDone, markTxAsFailed } from "../../redux/actions";
import { TransactionAction } from "../../redux/reducers/transactions";
import { afterTransaction } from "../../utils/blockchain";
import { LoadingAnimation } from "../Loading/Loading";

import buttonStyles from "../../style/button.module.css";
import styles from "./defi.module.css";
import { QueryKeys } from "../../queries/keys";
import { useQuery } from "@tanstack/react-query";
import { invalidateKey } from "../../queries/client";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { DEFISPRING_CONTRACT_ADDRESS } from "../../constants/amm";
import toast from "react-hot-toast";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";

export const RewardsWithAccount = ({
  account,
  address,
}: {
  account: AccountInterface;
  address: string | undefined;
}) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.defispring, address],
    queryFn: async () => getDefiSpringData(address!),
    enabled: !!address,
  });
  const { sendAsync } = useSendTransaction({
    calls: undefined,
  });

  const [claiming, setClaiming] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className={styles.outer}>
        <p>
          <Skeleton
            animation="wave"
            variant="text"
            sx={{ fontSize: "1.29rem", width: "140px" }}
          />
        </p>
        <div className={styles.box}>
          <div className={styles.deficontainer}>
            <div>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "160px" }}
                />
              </p>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "50px" }}
                />
              </p>
            </div>
            <div>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "160px" }}
                />
              </p>
              <p>
                <Skeleton
                  animation="wave"
                  variant="text"
                  sx={{ fontSize: "1.29rem", width: "50px" }}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <p>Something went wrong, please try again later</p>;
  }

  const calldata = [data.amount, data.proof.length, ...data.proof];

  const claim = async () => {
    setClaiming(true);
    try {
      const { transaction_hash: hash } = await sendAsync([
        {
          entrypoint: "claim",
          calldata,
          contractAddress: DEFISPRING_CONTRACT_ADDRESS,
        },
      ]);
      setClaiming(false);
      addTx(hash, `reward-claim-${hash}`, TransactionAction.ClaimReward);
      afterTransaction(
        hash,
        () => {
          markTxAsDone(hash);
          toast.success("Claim successfull");
          invalidateKey(QueryKeys.defispring);
        },
        () => {
          markTxAsFailed(hash);
          toast.error("Claim failed");
        }
      );
    } catch (e) {
      console.error(e);
      setClaiming(false);
    }
  };

  const { allocation, claimed } = data;

  const claimedHumanReadable = shortInteger(claimed, 18);
  const claimableHumanReadable = shortInteger(allocation - claimed, 18);

  const isAllClaimed = allocation === claimed;

  return (
    <div className={styles.outer}>
      <p>Ready to claim for {addressElision(account.address)}</p>
      <div className={styles.box}>
        <div className={styles.deficontainer}>
          <div>
            <p>Available to claim</p>
            <p>{claimableHumanReadable.toFixed(4)}</p>
          </div>
          <div>
            <p>Claimed</p>
            <p>{claimedHumanReadable.toFixed(4)}</p>
          </div>
        </div>
        {!isAllClaimed && (
          <div className={styles.buttoncontainer}>
            <button className={buttonStyles.secondary} onClick={claim}>
              {claiming ? (
                <LoadingAnimation />
              ) : (
                `Claim ${shortInteger(allocation - claimed, 18).toFixed(
                  4
                )} STRK`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const Rewards = () => {
  const { account, address } = useAccount();

  if (!account || !address) {
    return (
      <SecondaryConnectWallet msg="Connect wallet to access Starknet Rewards" />
    );
  }

  return <RewardsWithAccount account={account} address={address} />;
};
