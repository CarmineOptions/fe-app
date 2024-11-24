export type CarmineStakeResult = {
  amount_staked: bigint;
  amount_voting_token: bigint;
  start_date: bigint;
  length: bigint;
  withdrawn: boolean;
};

export type CarmineStakeResultWithId = {
  amount_staked: bigint;
  amount_voting_token: bigint;
  start_date: bigint;
  length: bigint;
  withdrawn: boolean;
  id: number;
};
