import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queries/keys";
import { useAccount } from "@starknet-react/core";
import { apiUrl } from "../api";

type RefResult = { status: string; data?: string };

const fetchReferralCode = async (address: string): Promise<string> => {
  const res = fetch(apiUrl(`get_referral?address=${address}`))
    .then((res) => res.json())
    .then((responseBody: RefResult) => {
      if (
        responseBody &&
        responseBody.status === "success" &&
        responseBody.data
      ) {
        return responseBody.data!;
      }
      throw Error("Failed getting referral code");
    });

  if (res) {
    return res;
  }

  throw Error("Failed getting referral code");
};

export const useReferralCode = () => {
  const { address } = useAccount();
  const { data, ...rest } = useQuery({
    queryKey: [QueryKeys.referral, address],
    queryFn: async () => fetchReferralCode(address!),
    enabled: !!address,
  });

  return {
    ...rest,
    referralCode: data as string | undefined,
  };
};
