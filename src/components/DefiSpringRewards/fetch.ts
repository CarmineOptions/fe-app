import { QueryFunctionContext } from "react-query";
import { getDefiSpringClaimed } from "../../calls/getDefiSpringClaim";

type ClaimCalldata = {
  amount: string;
  proof: string[];
};

export enum DefiSpringStatus {
  Initial = "INITIAL",
  Fetching = "FETCHING",
  Ready = "READY",
  Error = "ERROR",
}

export type DefiSpringData = {
  amount: string;
  proof: string[];
  allocation: bigint[];
  claimed: bigint;
};

const defiSpringUrl =
  "https://defi-spring-distribution-h5cslfrcca-ew.a.run.app";

export const fetchUserRoundAllocation = async (
  address: string,
  round: number
): Promise<bigint> => {
  const res = await fetch(
    `${defiSpringUrl}/get_allocation_amount?round=${round}&address=${address}`
  );

  const body = await res.json();

  return BigInt(body);
};

export const fetchUserAllocation = async (
  address: string
): Promise<bigint[]> => {
  const currentRound = 6;
  const promises = [];

  for (let round = 1; round <= currentRound; round++) {
    promises.push(fetchUserRoundAllocation(address, round));
  }
  const res = await Promise.all(promises);

  return res;
};

export const fetchCalldata = async (
  address: string
): Promise<ClaimCalldata> => {
  const res = await fetch(`${defiSpringUrl}/get_calldata?address=${address}`);

  if (res.status === 200) {
    return await res.json();
  }

  const message = await res.text();

  throw Error(message);
};

export const getDefiSpringData = async ({
  queryKey,
}: QueryFunctionContext<[string, string]>): Promise<DefiSpringData> => {
  const address = queryKey[1];

  const allocationPromise = fetchUserAllocation(address);
  const calldataPromise = fetchCalldata(address);
  const claimedPromise = getDefiSpringClaimed(address);

  const res: DefiSpringData | undefined = await Promise.all([
    allocationPromise,
    calldataPromise,
    claimedPromise,
  ])
    .then(([allocation, calldata, claimed]) => {
      return {
        allocation,
        claimed,
        amount: calldata.amount,
        proof: calldata.proof,
      };
    })
    .catch((err: Error) => {
      const { message } = err;

      if (message.includes("Address not found in tree")) {
        return {
          allocation: [],
          claimed: 0n,
          amount: "0",
          proof: [],
        };
      }
    });

  if (res) {
    return res;
  }

  throw Error("Failed getting defispring data");
};
