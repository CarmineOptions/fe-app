import { useQuery } from "@tanstack/react-query";

import { shortInteger } from "../../utils/computations";
import { Stakes } from "./Stakes";
import { QueryKeys } from "../../queries/keys";
import { fetchStakingData } from "./calls";
import { StakeCrm } from "./StakeCRM";
import { LoadingAnimation } from "../Loading/Loading";
import { formatNumber } from "../../utils/utils";
import { useAccount } from "@starknet-react/core";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";
import { P3 } from "../common";

export const CarmineStaking = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.carmineStakes, address],
    queryFn: async () => fetchStakingData(address!),
    enabled: !!address,
  });

  if (!address) {
    return (
      <SecondaryConnectWallet msg="Connect wallet to manage your stakes." />
    );
  }

  if (isLoading) {
    return <LoadingAnimation size={70} />;
  }

  if (isError || !data) {
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
      <div className="flex flex-col gap-4">
        <P3>
          Want to know more about <b>CRM</b> staking and <b>veCRM</b>?{" "}
          <a
            href="https://x.com/CarmineOptions/status/1806276899972202520"
            target="_blank"
            rel="noreferrer"
          >
            Find out here!
          </a>
          .
        </P3>
        <P3>
          You have {humanReadableCarmBalance} <b>CRM</b> and{" "}
          {humanReadableVeCarmBalance} <b>veCRM</b>
        </P3>
        {carmBalance > 0n && <StakeCrm carmBalance={carmBalance} />}
        <Stakes stakes={stakes} veBalance={veCarmBalance} />
      </div>
    </div>
  );
};
