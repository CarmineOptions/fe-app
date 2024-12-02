import { BraavosBonus } from "./fetch";
import { BraavosIcon } from "../Icons";
import { openBraavosBonusDialog } from "../../redux/actions";
import { P4 } from "../common";

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
    <div
      className="flex items-center flex-nowrap px-2 py-1 gap-1 rounded-md cursor-pointer bg-gradient-to-r from-[#1A4079] to-[#0F1242]"
      onClick={openBraavosBonusDialog}
    >
      <div className="flex items-center justify-center w-6 h-6">
        <BraavosIcon className="w-5 h-5" />
      </div>
      <P4 className="text-dark-primary text-nowrap overflow-hidden">
        +{bonus}% bonus
      </P4>
    </div>
  );
};
