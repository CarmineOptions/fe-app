import { useAccount } from "@starknet-react/core";
import toast from "react-hot-toast";
import { useReferralCode } from "../../hooks/useReferralCode";
import { Button, H5 } from "../common";

import LinkIcon from "./Link.svg?react";
import Tweety from "./TwitterBird.svg?react";

type ReferralProps = {
  message?: string;
  referralCode?: string;
};

const ReferralTemplate = ({ message, referralCode }: ReferralProps) => {
  const ReferralBox = () => {
    const link = `https://app.carmine.finance?ref_code=${referralCode}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(link);
      toast.success("Referral link copied");
    };

    const tweetRef = encodeURIComponent(
      `Come trade with me to @CarmineOptionsAMM!\n\nHere's my referral link!\n${link}`
    );
    const linkRef = `https://x.com/intent/tweet?text=${tweetRef}`;

    return (
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <span className="font-semibold text-5 mr-4">{referralCode}</span>
        <Button onClick={handleCopy}>
          <div className="flex gap-1 items-center">
            <span className="font-regular text-[12px] tracking-tighter normal-case">
              Copy referral link
            </span>
            <LinkIcon width="10.88px" height="9.38px" />
          </div>
        </Button>
        <a
          className="px-[12px] py-[2px] uppercase text-base font-semibold rounded-[2px] bg-dark-primary text-dark"
          href={linkRef}
          target="_blank"
          rel="noopener nofollow noreferrer"
        >
          <div className="flex gap-1 items-center">
            <span className="font-regular text-[12px] tracking-tighter normal-case">
              Tweet
            </span>
            <Tweety width="10.13px" height="9px" />
          </div>
        </a>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-big py-7 px-5 bg-dark-card border-black border-[1px]">
      <H5 className="text-brand">Earn 10% of the points your friends make.</H5>
      <div className="w-fit px-8 py-5 rounded-sm outline-dashed outline-2 outline-brand">
        {message ? message : <ReferralBox />}
      </div>
    </div>
  );
};

export const Referral = () => {
  const { address } = useAccount();
  const { isLoading, isError, referralCode } = useReferralCode();

  if (!address) {
    return (
      <ReferralTemplate message="Connect wallet to generate referral code" />
    );
  }

  if (isLoading) {
    return <ReferralTemplate message="Getting your referral link..." />;
  }

  if (isError || !referralCode) {
    return <ReferralTemplate message="Something went wrong" />;
  }

  return <ReferralTemplate referralCode={referralCode} />;
};
