import { AccountInterface } from "starknet";
import { useQuery } from "@tanstack/react-query";

import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { shortInteger } from "../../utils/computations";
import { Stakes } from "./Stakes";
import { QueryKeys } from "../../queries/keys";
import { fetchStakingData } from "./calls";
import { StakeCrm } from "./StakeCRM";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber } from "../../utils/utils";
import { useAccount, useConnect } from "@starknet-react/core";

export const StakeWithAccount = ({
  account,
  address,
}: {
  account: AccountInterface;
  address: string;
}) => {
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.carmineStakes, address],
    queryFn: async () => fetchStakingData(address),
  });
  if (isLoading || !data) {
    return <LoadingAnimation size={70} />;
  }

  if (isError) {
    return <div>Something went wrong, please try again later</div>;
  }

  const { veCarmBalance, carmBalance, stakes } = data;
  const humanReadableVeCarmBalance = formatNumber(
    shortInteger(veCarmBalance, 18),
    4
  );
  const humanReadableCarmBalance = formatNumber(
    shortInteger(carmBalance, 18),
    4
  );

  return (
    <div>
      <p>
        Want to know more about <b>CRM</b> staking and <b>veCRM</b>?{" "}
        <a
          href="https://x.com/CarmineOptions/status/1806276899972202520"
          target="_blank"
          rel="noreferrer"
        >
          Find out here!
        </a>
        .
      </p>

      <p>
        You have {humanReadableCarmBalance} <b>CRM</b> and{" "}
        {humanReadableVeCarmBalance} <b>veCRM</b>
      </p>
      {carmBalance > 0n && (
        <StakeCrm account={account} carmBalance={carmBalance} />
      )}

      <Stakes stakes={stakes} veBalance={veCarmBalance} account={account} />
    </div>
  );
};

export const CarmineStaking = () => {
  const { account, address } = useAccount();
  const { connectAsync } = useConnect();

  if (!account || !address) {
    return (
      <button onClick={() => openWalletConnectDialog(connectAsync)}>
        Connect wallet
      </button>
    );
  }

  return <StakeWithAccount account={account} address={address} />;
};
