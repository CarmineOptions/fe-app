import { Skeleton } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../../queries/keys";
import { fetchBraavosBonus } from "../Points/fetch";
import { useAccount } from "@starknet-react/core";

import { ReactComponent as BraavosIcon } from "../Points/braavos_icon.svg";
import { ReactComponent as TwitterX } from "./twitterx.svg";

import styles from "./braavos.module.css";

export const BraavosDialog = () => {
  const { account } = useAccount();
  const { data, isLoading, isError } = useQuery({
    queryKey: [QueryKeys.braavosBonus],
    queryFn: fetchBraavosBonus,
  });

  if (!account) {
    return (
      <div className={styles.modal}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <BraavosIcon style={{ width: "30px", height: "30px" }} />
          <span style={{ fontSize: "25px" }}>Braavos Boost</span>
        </div>
        <div>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Connect your wallet to see which Braavos bonus you are eligible for!
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || isError || !data) {
    return (
      <div className={styles.modal}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="300px" height="50px" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="100%" height="100px" />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Skeleton variant="text" width="100%" height="80px" />
        </div>
      </div>
    );
  }

  const tweet = encodeURIComponent(
    "I just got a #BraavosBoost on @CarmineOptions 👀\n\nHere's a referral link you can use to amplify your points by up to 1.3x https://app.carmine.finance/?ref_code=braavos-referral-bonus\n\nMake sure you connect with @myBraavos to be eligible 💪"
  );
  const link = `https://x.com/intent/tweet?text=${tweet}`;

  const tweetRef = encodeURIComponent(
    "I'm looking for a #BraavosBoost on @CarmineOptions👀\n\n@myBraavos can I get a referral link?"
  );
  const linkRef = `https://x.com/intent/tweet?text=${tweetRef}`;

  const userData = data[account.address];

  const proScore = userData && userData.pro_score_80;
  const braavosReferral = userData && userData.braavos_referral;

  const bonusApplied = proScore || braavosReferral; // at least one of the bonuses

  return (
    <div className={styles.modal}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <BraavosIcon style={{ width: "30px", height: "30px" }} />
        <span style={{ fontSize: "25px" }}>
          Braavos Boost{bonusApplied && " applied!"}
        </span>
      </div>
      {braavosReferral ? (
        <div>
          <h5>✅ Referral Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Great news! You are eligible for the Braavos referral boost of 1.2x
            on Carmine points.
          </p>
        </div>
      ) : (
        <div>
          <h5>❌ Referral Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Oops! No referral boost for you yet. Use the Braavos referral code
            to unlock a sweet 1.2x bonus.
          </p>
        </div>
      )}

      {proScore ? (
        <div>
          <h5>✅ Pro-score Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            Awesome! You’re a power user! Enjoy an extra 10% boost on Carmine
            points.
          </p>
        </div>
      ) : (
        <div>
          <h5>❌ Pro-score Boost</h5>
          <p style={{ fontSize: "17px", textAlign: "left", color: "#9daee5" }}>
            So close! Raise your Pro-score to 80 and snag an additional 10%
            boost.
          </p>
        </div>
      )}

      <div className={styles.ctas}>
        {bonusApplied ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <a
              className={styles.tweet}
              href={link}
              target="_blank"
              rel="noopener nofollow noreferrer"
            >
              <TwitterX width="20px" />
              Share
            </a>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <a
              className={styles.tweet}
              href={linkRef}
              target="_blank"
              rel="noopener nofollow noreferrer"
            >
              <TwitterX width="20px" />
              Don't have a link? Get one &rarr;
            </a>
          </div>
        )}
        {braavosReferral && !proScore && (
          <a
            className={styles.learnmore}
            target="_blank"
            rel="noopener nofollow noreferrer"
            href="https://braavos.app/starknet-pro-score-guide/"
          >
            Learn more &rarr;
          </a>
        )}
      </div>
    </div>
  );
};
