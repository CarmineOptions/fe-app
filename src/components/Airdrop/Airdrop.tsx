import { FunctionComponent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useSendTransaction } from "@starknet-react/core";

import { Eligible, getProof } from "./getProof";
import { shortInteger } from "../../utils/computations";
import { DEFISPRING_CONTRACT_ADDRESS, isMainnet } from "../../constants/amm";
import { QueryKeys } from "../../queries/keys";
import { AirdropModal } from "./AirdropModal";
import { formatNumber } from "../../utils/utils";
import { Button, H6, L2, P3, P4 } from "../common";
import { SecondaryConnectWallet } from "../ConnectWallet/Button";

import CarmineLogo from "./Carmine.svg?react";
import StarknetLogo from "./Starknet.svg?react";
import { getDefiSpringData } from "../DefiSpringRewards/fetch";
import toast from "react-hot-toast";
import { invalidateKey } from "../../queries/client";
import { addTx, markTxAsDone, markTxAsFailed } from "../../redux/actions";
import { TransactionAction } from "../../redux/reducers/transactions";
import { afterTransaction } from "../../utils/blockchain";

type NoWalletTemplateProps = {
  headingClass: string;
  headingText: string;
  text: string;
  Logo: FunctionComponent<React.SVGProps<SVGSVGElement>>;
};

const CarmineAirdrop = ({ data }: { data?: Eligible }) => {
  const [open, setOpen] = useState(false);

  const claimable = data?.claimable
    ? formatNumber(shortInteger(data.claimable, 18))
    : 0;

  const claimed = data?.claimed
    ? formatNumber(shortInteger(data.claimed, 18))
    : 0;

  return (
    <div className="flex justify-between max-w-big text-dark-secondary bg-light-secondary rounded-md overflow-hidden">
      <div className="flex flex-col grow justify-around">
        <div className="flex flex-col gap-3 p-5 border-dark-tertiary border-b-[1px]">
          <H6 className="text-brand">Carmine CRM Airdrop</H6>
          <P4 className="font-semibold">CRM Airdrop for Carmine OGs!</P4>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <P4 className="text-dark-secondary">Available to claim</P4>
                <P3 className="font-semibold text-dark-primary">
                  {claimable} veCRM
                </P3>
              </div>
              {claimable !== 0 && (
                <Button
                  type="primary"
                  className="normal-case px-8 w-fit"
                  onClick={() => setOpen(true)}
                  padding="8px 41.5px"
                >
                  Claim Rewards
                </Button>
              )}
            </div>
          </div>
          <div>
            <div>
              <P4 className="text-dark-secondary">Previously claimed</P4>
              <P3 className="font-semibold text-dark-primary">
                {claimed} veCRM
              </P3>
            </div>
          </div>
        </div>
        <div className="p-5">
          <L2>
            Carmine Options AMM is part of{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://www.starknet.io/blog/starknet-foundation-introduces-the-start-of-defi-spring/"
            >
              Starknet's DeFi Spring
            </a>{" "}
            incentive.{" "}
          </L2>
        </div>
      </div>
      <div className="hidden lg:block">
        <CarmineLogo className="h-full w-auto" />
      </div>
      {data !== undefined && (
        <AirdropModal data={data} open={open} setOpen={setOpen} />
      )}
    </div>
  );
};

export const CarmineAirdropWithAccount = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.airdropData, address],
    queryFn: async () => getProof(address!),
    enabled: !!address,
  });

  if (isError) {
    return (
      <NoWalletAirdropTemplate
        headingClass="text-brand"
        headingText="Carmine CRM Airdrop"
        text="Something went wrong, please try again later."
        Logo={CarmineLogo}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <NoWalletAirdropTemplate
        headingClass="text-brand"
        headingText="Carmine CRM Airdrop"
        text="Checking if you are eligible for an airdrop..."
        Logo={CarmineLogo}
      />
    );
  }

  if (data.eligible) {
    return <CarmineAirdrop data={data} />;
  }

  return <CarmineAirdrop />;
};

export const StarknetDefispring = () => {
  const { address } = useAccount();
  const { isLoading, isError, data } = useQuery({
    queryKey: [QueryKeys.defispring, address],
    queryFn: async () => getDefiSpringData(address!),
    enabled: !!address,
  });
  const { sendAsync } = useSendTransaction({
    calls: undefined,
  });
  const [claiming, setClaiming] = useState<boolean>(false);

  if (!address) {
    return (
      <NoWalletAirdropTemplate
        headingClass="text-misc-starknet"
        headingText="Starknet DeFi Spring Rewards"
        text="40M STRK up for grabs! Provide liquidity to start earning."
        Logo={StarknetLogo}
      />
    );
  }

  if (isError) {
    return (
      <NoWalletAirdropTemplate
        headingClass="text-misc-starknet"
        headingText="Starknet DeFi Spring Rewards"
        text="Something went wrong, please try again later."
        Logo={StarknetLogo}
      />
    );
  }

  if (isLoading || !data) {
    return (
      <NoWalletAirdropTemplate
        headingClass="text-misc-starknet"
        headingText="Starknet DeFi Spring Rewards"
        text="Checking if you are eligible for an airdrop..."
        Logo={StarknetLogo}
      />
    );
  }

  const calldata = [data.amount, data.proof.length, ...data.proof];

  const claim = async () => {
    setClaiming(true);
    try {
      const { transaction_hash: hash } = await sendAsync([
        {
          entrypoint: "claim",
          calldata,
          contractAddress: DEFISPRING_CONTRACT_ADDRESS,
        },
      ]);
      setClaiming(false);
      addTx(hash, `reward-claim-${hash}`, TransactionAction.ClaimReward);
      afterTransaction(
        hash,
        () => {
          markTxAsDone(hash);
          toast.success("Claim successfull");
          invalidateKey(QueryKeys.defispring);
        },
        () => {
          markTxAsFailed(hash);
          toast.error("Claim failed");
        }
      );
    } catch (e) {
      console.error(e);
      setClaiming(false);
    }
  };

  const { allocation, claimed } = data;

  const claimedHumanReadable = shortInteger(claimed, 18);
  const claimableHumanReadable = shortInteger(allocation - claimed, 18);

  const isAllClaimed = allocation === claimed;

  return (
    <div className="flex justify-between max-w-big text-dark-secondary bg-light-secondary rounded-md overflow-hidden">
      <div className="flex flex-col grow justify-around">
        <div className="flex flex-col gap-3 p-5 border-dark-tertiary border-b-[1px]">
          <H6 className="text-misc-starknet">Starknet DeFi Spring Rewards</H6>
          <P4 className="font-semibold">
            40M STRK up for grabs! Provide liquidity to start earning.
          </P4>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <P4 className="text-dark-secondary">Available to claim</P4>
                <P3 className="font-semibold text-dark-primary">
                  {formatNumber(claimableHumanReadable)} STRK
                </P3>
              </div>
              {!isAllClaimed && (
                <Button
                  type="primary"
                  className="normal-case px-8 w-fit"
                  onClick={claim}
                  padding="8px 41.5px"
                  disabled={claiming}
                >
                  Claim Rewards
                </Button>
              )}
            </div>
          </div>
          <div>
            <div>
              <P4 className="text-dark-secondary">Previously claimed</P4>
              <P3 className="font-semibold text-dark-primary">
                {formatNumber(claimedHumanReadable)} STRK
              </P3>
            </div>
          </div>
        </div>
        <div className="p-5">
          <L2>
            Carmine Options AMM is part of{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://www.starknet.io/blog/starknet-foundation-introduces-the-start-of-defi-spring/"
            >
              Starknet's DeFi Spring
            </a>{" "}
            incentive.{" "}
          </L2>
        </div>
      </div>
      <div className="hidden lg:block">
        <StarknetLogo className="h-full w-auto" />
      </div>
    </div>
  );
};

const NoWalletAirdropTemplate = ({
  headingClass,
  headingText,
  text,
  Logo,
}: NoWalletTemplateProps) => {
  return (
    <div className="flex justify-between max-w-big text-dark-secondary bg-light-secondary rounded-md overflow-hidden">
      <div className="flex flex-col grow justify-around">
        <div className="flex flex-col gap-3 p-5 border-dark-tertiary border-b-[1px]">
          <H6 className={headingClass}>{headingText}</H6>
          <P4 className="font-semibold">{text}</P4>
        </div>
        <div className="p-5">
          <L2>
            Carmine Options AMM is part of{" "}
            <a
              className="underline"
              target="_blank"
              rel="noreferrer"
              href="https://www.starknet.io/blog/starknet-foundation-introduces-the-start-of-defi-spring/"
            >
              Starknet's DeFi Spring
            </a>{" "}
            incentive.{" "}
          </L2>
        </div>
      </div>
      <div className="hidden lg:flex h-[164px] justify-center items-center">
        <Logo />
      </div>
    </div>
  );
};

export const Airdrop = () => {
  const { address } = useAccount();

  if (!isMainnet) {
    return null;
  }

  if (!address) {
    return (
      <div className="flex flex-col gap-7">
        <SecondaryConnectWallet msg="Connect your wallet to view your airdrops." />
        <NoWalletAirdropTemplate
          headingClass="text-misc-starknet"
          headingText="Starknet DeFi Spring Rewards"
          text="40M STRK up for grabs! Provide liquidity to start earning."
          Logo={StarknetLogo}
        />
        <NoWalletAirdropTemplate
          headingClass="text-brand"
          headingText="Carmine CRM Airdrop"
          text="CRM Airdrop for Carmine OGs!"
          Logo={CarmineLogo}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <CarmineAirdropWithAccount />
      <StarknetDefispring />
    </div>
  );
};
