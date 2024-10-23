import { apiUrl } from "../../api";

export type UserPoints = {
  address: string;
  trading_points: number;
  liquidity_points: number;
  referral_points: number;
  vote_points: number;
  total_points: number;
  position: number;
};

export type BraavosBonus = {
  pro_score_80: number | null;
  braavos_referral: number | null;
};

export const fetchTopUserPoints = async (): Promise<UserPoints[]> =>
  fetch(apiUrl("top-user-points"))
    .then((res) => res.json())
    .then((res) => {
      if (res?.status !== "success" || !res?.data?.length) {
        return [];
      }

      return res.data;
    });

export const fetchUserPoints = async (address: string): Promise<UserPoints> =>
  fetch(apiUrl("user-points") + `?address=${address}`)
    .then((res) => res.json())
    .then((res) => {
      if (res?.status === "success") {
        return res.data;
      }
    });

export const fetchBraavosBonus = async (): Promise<{
  [key: string]: BraavosBonus;
}> =>
  fetch(apiUrl("braavos-proscore"))
    .then((res) => res.json())
    .then((res) => {
      if (res?.status === "success") {
        return res.data;
      }
    });
