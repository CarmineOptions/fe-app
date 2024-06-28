import { useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import { defiSpringClaim } from "../../calls/getDefiSpringClaim";
import { AccountInterface } from "starknet";
import { getDefiSpringData } from "./fetch";
import { shortInteger } from "../../utils/computations";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { Skeleton } from "@mui/material";
import { addressElision } from "../../utils/utils";
import {
  addTx,
  markTxAsDone,
  markTxAsFailed,
  showToast,
} from "../../redux/actions";
import { TransactionAction } from "../../redux/reducers/transactions";
import { afterTransaction } from "../../utils/blockchain";
import { ToastType } from "../../redux/reducers/ui";
import { LoadingAnimation } from "../Loading/Loading";

import buttonStyles from "../../style/button.module.css";
import styles from "./defi.module.css";
import { QueryKeys } from "../../queries/keys";
import { useQuery } from "react-query";
import { invalidateKey } from "../../queries/client";

export const RewardsWithAccount = ({
  account,
}: {
  account: AccountInterface;
}) => {
  const address = account.address;

  const { isLoading, isError, data } = useQuery(
    [QueryKeys.defispring, address],
    getDefiSpringData
  );

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

  const call = [data.amount, data.proof.length, ...data.proof];

  const claim = async () => {
    setClaiming(true);
    try {
      const { transaction_hash: hash } = await defiSpringClaim(account, call);
      setClaiming(false);
      addTx(hash, `reward-claim-${hash}`, TransactionAction.ClaimReward);
      afterTransaction(
        hash,
        () => {
          markTxAsDone(hash);
          showToast("Claim successfull", ToastType.Success);
          invalidateKey(QueryKeys.defispring);
        },
        () => {
          markTxAsFailed(hash);
          showToast("Claim failed", ToastType.Error);
        }
      );
    } catch (_) {
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
  const account = useAccount();

  if (!account) {
    return (
      <div>
        <p>Connect wallet to access Starknet Rewards</p>
        <button
          className={buttonStyles.secondary}
          onClick={openWalletConnectDialog}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return <RewardsWithAccount account={account} />;
};
