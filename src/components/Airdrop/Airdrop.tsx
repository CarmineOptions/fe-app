import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "@starknet-react/core";

import { Eligible, getProof } from "./getProof";
import { shortInteger } from "../../utils/computations";
import { isMainnet } from "../../constants/amm";
import { QueryKeys } from "../../queries/keys";
import { AirdropModal } from "./AirdropModal";
import airdropStyles from "./airdrop.module.css";
import { formatNumber } from "../../utils/utils";

const ClaimAndStake = ({ data }: { data: Eligible }) => {
  const [open, setOpen] = useState(false);
  const amountHumanReadable = shortInteger(data.claimable, 18);

  return (
    <div>
      <div className={airdropStyles.claim}>
        <p>
          You are eligible to claim {amountHumanReadable} <b>veCRM</b>!
        </p>
        <button className="primary active" onClick={() => setOpen(true)}>
          Claim
        </button>
      </div>
      <AirdropModal data={data} open={open} setOpen={setOpen} />
    </div>
  );
};

const AirdropTemplate = ({ message }: { message: string }) => (
  <div className={airdropStyles.textcontainer}>
    <p>{message}</p>
  </div>
);

export const AirdropWithAccount = ({ address }: { address: string }) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.airdropData, address],
    queryFn: async () => getProof(address),
  });

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

    return <ClaimAndStake data={data} />;
  }

  return (
    <AirdropTemplate message="Connected wallet is not eligible for an airdrop" />
  );
};

export const Airdrop = () => {
  const { address } = useAccount();

  if (!address) {
    return (
      <AirdropTemplate message="Connect your wallet to see if you are eligible for an airdrop" />
    );
  }

  if (!isMainnet) {
    return (
      <AirdropTemplate message="Please switch to Mainnet to access airdrop" />
    );
  }

  return <AirdropWithAccount address={address} />;
};
