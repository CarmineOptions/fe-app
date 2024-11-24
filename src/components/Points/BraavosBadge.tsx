import { BraavosBonus } from "./fetch";
import { BraavosIcon } from "../Icons";
import styles from "./points.module.css";
import { openBraavosBonusDialog } from "../../redux/actions";

export const BraavosBadge = ({ data }: { data: BraavosBonus }) => {
  let bonus = 0;
  if (data.pro_score_80 !== null) {
    bonus += 10;
  }
  if (data.braavos_referral !== null) {
    bonus += 20;
  }

  if (bonus === 0) {
    return null;
  }
  return (
    <div className={styles.braavosbadge} onClick={openBraavosBonusDialog}>
      <div>
        <BraavosIcon style={{ width: "20px", height: "20px" }} />
      </div>
      <span>+{bonus}% bonus</span>
    </div>
  );
};
