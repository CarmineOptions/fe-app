import { AccountInterface } from "starknet";
import { Skeleton } from "@mui/material";
import { useQuery } from "react-query";

import { useAccount } from "../../hooks/useAccount";
import { openWalletConnectDialog } from "../ConnectWallet/Button";
import { shortInteger } from "../../utils/computations";
import { Stakes } from "./Stakes";
import { QueryKeys } from "../../queries/keys";
import { fetchStakingData } from "./calls";
import { StakeCrm } from "./StakeCRM";

export const StakeWithAccount = ({
  account,
}: {
  account: AccountInterface;
}) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.carmineStakes, account.address],
    fetchStakingData
  );
  if (isLoading || !data) {
    return <Skeleton width={400} height={150} />;
  }

  if (isError) {
    return <div>Something went wrong, please try again later</div>;
  }

  const { veCarmBalance: _, carmBalance, stakes } = data;
  const veCarmBalance = 12345n * 10n ** 16n;
  const humanReadableVeCarmBalance = shortInteger(veCarmBalance, 18);
  const humanReadableCarmBalance = shortInteger(carmBalance, 18);

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
  const account = useAccount();

  if (!account) {
    return <button onClick={openWalletConnectDialog}>Connect wallet</button>;
  }

  return <StakeWithAccount account={account} />;
};
