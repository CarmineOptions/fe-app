import { useEffect, useMemo, useState } from "react";
import { useAccount } from "../../hooks/useAccount";
import {
  defiSpringClaim,
  getDefiSpringClaimed,
} from "../../calls/getDefiSpringClaim";
import { QueryKeys } from "../../queries/keys";
import { useQuery } from "react-query";
import { AccountInterface } from "starknet";
import { fetchUserAllocation } from "./fetch";
import { shortInteger } from "../../utils/computations";

import buttonStyles from "../../style/button.module.css";

export const RewardsWithAccount = ({
  account,
}: {
  account: AccountInterface;
}) => {
  const BASE_BACKEND_URL =
    "https://defi-spring-distribution-h5cslfrcca-ew.a.run.app/";
  const address = account.address;

  // Data to be utilized for claiming tokens
  interface ClaimCalldata {
    // How much to claim. Should always claim the maximum amount
    amount: string;
    // Merkle proof for the claim
    proof: string[];
  }

  const [allocationAmount, setAllocationAmount] = useState<BigInt>(BigInt(0));
  const [receivedcalldata, setReceivedCalldata] = useState<ClaimCalldata>();
  const [isClaimReady, setIsClaimReady] = useState<boolean>(false);
  const [errors, setErrors] = useState<String>("");

  const { data: alreadyClaimed } = useQuery(
    [QueryKeys.defiSpringClaimed, address],
    getDefiSpringClaimed
  );

  useEffect(() => {
    if (account) {
      prepareClaim(account.address);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchUserAllocation(account).then((res) => setAllocationAmount(res));
    }
  }, [account]);

  const calls = useMemo(() => {
    if (!receivedcalldata) return [];

    if (!receivedcalldata.amount) {
      setErrors(receivedcalldata.toString());
      return;
    }

    return [
      receivedcalldata.amount,
      receivedcalldata.proof.length,
      ...receivedcalldata.proof,
    ];
  }, [receivedcalldata, account]);

  // Retrieves calldata for the claim
  const prepareClaim = async (usedAddress: String) => {
    if (!usedAddress) {
      console.error("No wallet connected");
      return;
    }

    const response = await fetch(
      BASE_BACKEND_URL + "get_calldata?address=" + usedAddress
    );
    const calldata: ClaimCalldata = await response.json();

    setReceivedCalldata(calldata);

    setIsClaimReady(true);
  };

  const claim = async () => {
    if (!isClaimReady || !calls) {
      console.error("Prepare the claim first");
      return;
    }
    await defiSpringClaim(account, calls);
  };

  const claimed =
    alreadyClaimed !== undefined && shortInteger(alreadyClaimed, 18);
  const totalAllocation = shortInteger(allocationAmount.toString(), 18);

  return (
    <div>
      <div>
        {typeof claimed === "number" && (
          <div>Already claimed: STRK {claimed.toFixed(4)}</div>
        )}
        <div>
          <p>Total allocated amount: STRK {totalAllocation.toFixed(4)}</p>
        </div>
        {errors && (
          <div>
            <p style={{ color: "red" }}>Errors: {errors}</p>
          </div>
        )}
      </div>
      {isClaimReady && claimed !== false && (
        <div>
          <div>
            <p>Claimable: STRK {totalAllocation - claimed}</p>
            <button
              disabled={totalAllocation === claimed}
              className={
                totalAllocation === claimed
                  ? buttonStyles.disabled
                  : buttonStyles.secondary
              }
              onClick={claim}
            >
              Claim allocation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Rewards = () => {
  const account = useAccount();

  if (!account) {
    return (
      <div>
        <p>Connect wallet to access Starknet Rewards</p>
      </div>
    );
  }

  return <RewardsWithAccount account={account} />;
};
