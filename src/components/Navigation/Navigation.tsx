import { FunctionComponent, ReactNode, SVGProps } from "react";
import { NavLink } from "react-router-dom";
import {
  Medal,
  Scroll,
  ShieldPlus,
  ShuffleAngular,
  Strategy,
  Subtract,
  Sword,
  Wallet,
} from "../Icons";
import { setShowNavigation } from "../../redux/actions";
import { L2, P3 } from "../common/Typography";
import { useShowNavigation } from "../../hooks/useShowNavigation";

import Parachute from "./Parachute.svg?react";
import Stark from "./Strk.svg?react";
import ParachuteActive from "./ParachuteActive.svg?react";
import StarkActive from "./StrkActive.svg?react";

const Nav = ({
  title,
  path,
  icon: Icon,
  badge,
  isActive = false,
}: {
  title: string;
  path: string;
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  isActive: boolean;
  badge?: ReactNode;
}) => {
  return (
    <li
      className={`rounded-[2px] transition duration-300 ease-in-out cursor-pointer ${
        isActive
          ? "bg-brand-deep text-dark-primary"
          : "text-dark-secondary hover:text-dark-primary"
      }`}
    >
      <NavLink
        to={`/${path}`}
        className="block px-1 py-2"
        onClick={() => setShowNavigation(false)}
      >
        <div className="flex gap-[12px] items-center">
          <div className="flex gap-1 items-center">
            <Icon
              style={
                isActive
                  ? {
                      stroke: "white",
                    }
                  : {}
              }
            />
            <P3>{title}</P3>
          </div>
          {badge !== undefined && badge}
        </div>
      </NavLink>
    </li>
  );
};

type BadgeProps = {
  active: boolean;
};

const NewBadge = ({ active }: BadgeProps) => (
  <div className={`${active ? "bg-dark" : "bg-brand"} p-1 flex rounded-[2px]`}>
    <L2 className={`font-bold ${active ? "text-dark-primary" : "text-dark"}`}>
      NEW
    </L2>
  </div>
);

const AirdropBadge = ({ active }: BadgeProps) => (
  <div
    className={`${
      active ? "bg-dark" : "bg-brand"
    }  p-1 flex items-center gap-1 rounded-[2px]`}
  >
    {active ? <ParachuteActive /> : <Parachute />}
    <L2 className={`font-bold ${active ? "text-dark-primary" : "text-dark"}`}>
      AIRDROP
    </L2>
  </div>
);

const RewardsBadge = ({ active }: BadgeProps) => (
  <div
    className={`${
      active ? "bg-dark" : "bg-[#FF75C8]"
    }  p-1 flex items-center gap-1 rounded-[2px]`}
  >
    {active ? (
      <StarkActive width="10px" height="10px" />
    ) : (
      <Stark width="10px" height="10px" />
    )}
    <L2 className={`font-bold ${active ? "text-dark-primary" : "text-dark"}`}>
      REWARDS
    </L2>
  </div>
);

export const Navigation = () => {
  const isOpen = useShowNavigation();
  const current = window.location.pathname.split("/")[1];

  return (
    <div
      className={`w-[200px] h-inherit box-border bg-dark-container border-dark-tertiary border-r-[1px] px-5 py-20 md:relative top-0 absolute z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? "left-0" : "-left-[200px] md:left-0"
      }`}
    >
      <nav className="w-[160px] flex flex-col gap-[50px]">
        <ul className="flex flex-col gap-[12px]">
          <Nav
            title="Portfolio"
            path="portfolio"
            icon={Wallet}
            isActive={current === "portfolio"}
            badge={<AirdropBadge active={current === "portfolio"} />}
          />
          <Nav
            title="Options"
            path="trade"
            icon={Strategy}
            isActive={current === "trade" || current === ""}
          />
          <Nav
            title="Price Protect"
            path="priceprotect"
            icon={ShieldPlus}
            badge={<NewBadge active={current === "priceprotect"} />}
            isActive={current === "priceprotect"}
          />
          <Nav
            title="Yield"
            path="yield"
            icon={Subtract}
            isActive={current === "yield"}
            badge={<RewardsBadge active={current === "yield"} />}
          />
          <Nav
            title="Swap"
            path="swap"
            icon={ShuffleAngular}
            isActive={current === "swap"}
          />
          <Nav
            title="Points"
            path="leaderboard"
            icon={Medal}
            isActive={current === "leaderboard"}
          />
          <Nav
            title="Governance"
            path="governance"
            icon={Scroll}
            isActive={current === "governance"}
          />
          <Nav
            title="Battlecharts"
            path="battlecharts"
            icon={Sword}
            badge={<NewBadge active={current === "battlecharts"} />}
            isActive={current === "battlecharts"}
          />
        </ul>
        <ul className="flex flex-col gap-[12px] border-dark-tertiary border-t-[1px] pt-[12px]">
          <li>
            <a
              className="text-dark-secondary"
              href="https://docs.carmine.finance/carmine-options-amm/audit"
            >
              Audits
            </a>
          </li>
          <li>
            <a
              className="text-dark-secondary"
              href="https://legacy.app.carmine.finance"
            >
              Legacy App
            </a>
          </li>
        </ul>
        <ul className="flex flex-col gap-[12px] border-dark-tertiary border-b-[1px] pb-[12px]">
          <li>
            <a
              className="text-dark-secondary"
              href="https://twitter.com/CarmineOptions"
            >
              Twitter
            </a>
          </li>
          <li>
            <a
              className="text-dark-secondary"
              href="https://discord.gg/uRs7j8w3bX"
            >
              Discord
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};
