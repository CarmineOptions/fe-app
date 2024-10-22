import { useState } from "react";
import { useQuery } from "react-query";
import { AccountInterface } from "starknet";

import { Eligible, getAirdropDataQuery } from "./getProof";
import { shortInteger } from "../../utils/computations";
import { isMainnet } from "../../constants/amm";
import { QueryKeys } from "../../queries/keys";
import { AirdropModal } from "./AirdropModal";
import airdropStyles from "./airdrop.module.css";
import { formatNumber } from "../../utils/utils";
import { useAccount } from "@starknet-react/core";

const ClaimAndStake = ({
  account,
  data,
}: {
  account: AccountInterface;
  data: Eligible;
}) => {
  const [open, setOpen] = useState(false);
  const amountHumanReadable = shortInteger(data.claimable, 18);

  return (
    <div>
      <div className={airdropStyles.claim}>
        <span>
          You are eligible to claim {amountHumanReadable} <b>veCRM</b>!
        </span>
        <button className="primary active" onClick={() => setOpen(true)}>
          Claim
        </button>
      </div>
      <AirdropModal
        account={account}
        data={data}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

const AirdropTemplate = ({ message }: { message: string }) => (
  <div className={airdropStyles.textcontainer}>{message}</div>
);

export const AirdropWithAccount = ({
  account,
}: {
  account: AccountInterface;
}) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.airdropData, account.address],
    getAirdropDataQuery
  );

  if (isError) {
    return (
      <AirdropTemplate message="Something went wrong, please try again later." />
    );
  }

  if (isLoading || !data) {
    return (
      <AirdropTemplate message="Checking if you are eligible for an airdrop..." />
    );
  }

  if (data.eligible) {
    if (data.claimable === 0n) {
      const amount = formatNumber(shortInteger(data.claimed, 18), 5);
      return (
        <AirdropTemplate
          message={`You cannot claim any tokens, you have already claimed ${amount} CRM`}
        />
      );
    }

    return <ClaimAndStake account={account} data={data} />;
  }

  return (
    <AirdropTemplate message="Connected wallet is not eligible for an airdrop" />
  );
};

export const Airdrop = () => {
  const { account } = useAccount();

  if (!account) {
    return (
      <AirdropTemplate message="Connect your wallet to see if you are eligible for an airdrop" />
    );
  }

  if (!isMainnet) {
    return (
      <AirdropTemplate message="Please switch to Mainnet to access airdrop" />
    );
  }

  return <AirdropWithAccount account={account} />;
};
