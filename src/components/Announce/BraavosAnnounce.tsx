import { useEffect, useState } from "react";
import { isCookieSet, setCookieWithExpiry } from "../../utils/cookies";
import { ReactComponent as BraavosIcon } from "../Points/braavos_icon.svg";
import styles from "./announce.module.css";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchBraavosBonus } from "../Points/fetch";
import { useAccount } from "@starknet-react/core";

const cookieName = "carmine-braavos-bonus-announce";
const HIDE_TIME_MS = 1; // for the duration of this session

const shouldShow = () => !isCookieSet(cookieName);

const setShowCookie = () =>
  setCookieWithExpiry(cookieName, "closed", HIDE_TIME_MS);

export const BraavosAnnounce = () => {
  const { account } = useAccount();
  const [show, setShow] = useState(shouldShow());
  const { data, isLoading, isError } = useQuery({
    queryKey: [QueryKeys.braavosBonus],
    queryFn: fetchBraavosBonus,
  });
  const handleClose = () => {
    setShowCookie();
    setShow(false);
  };

  useEffect(() => {
    if (account && show && data) {
      setTimeout(handleClose, 5000);
    }
  }, [account, data, show]);

  if (window?.location?.pathname === "/price-protect-video") {
    // do not show in video popup
    return null;
  }

  if (isLoading || isError || !data || !show || !account) {
    return null;
  }

  const userData = data[account.address];
  const proScore = userData && userData.pro_score_80;
  const braavosReferral = userData && userData.braavos_referral;

  const bonusApplied = proScore || braavosReferral; // at least one of the bonuses

  if (!bonusApplied) {
    return null;
  }

  let bonus = 1;
  if (proScore) bonus += 0.1;
  if (braavosReferral) bonus += 0.2;

  return (
    <div className={styles.braavosannounce}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <BraavosIcon style={{ width: "30px", height: "30px" }} />
        <span style={{ fontSize: "25px" }}>Braavos Boost applied!</span>
      </div>
      <div>
        <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
          You are eligible for {bonus}x Braavos Boost. Your Carmine points will
          be multiplied by {bonus}x.
        </p>
        <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
          Enjoy!
        </p>
      </div>
    </div>
  );
};
