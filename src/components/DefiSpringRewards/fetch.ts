import { AccountInterface } from "starknet";

export type AllocationCalldata = {};

const defiSpringUrl =
  "https://defi-spring-distribution-h5cslfrcca-ew.a.run.app";

export const fetchUserAllocation = async (
  account: AccountInterface
): Promise<bigint> => {
  const res = await fetch(
    `${defiSpringUrl}/get_allocation_amount?address=${account.address}`
  );

  const body = await res.json();

  return BigInt(body);
};

export const fetchCalldata = async (
  account: AccountInterface
): Promise<AllocationCalldata> => {
  const res = await fetch(
    `${defiSpringUrl}/get_calldata?address=${account.address}`
  );

  const body = await res.json();
  return body;
};
