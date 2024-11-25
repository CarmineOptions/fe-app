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
import Parachute from "./Parachute.svg?react";
import Stark from "./Strk.svg?react";

import { L2, P3 } from "../common/Typography";

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
      className={`px-[4px] py-[8px] rounded-[2px] transition duration-300 ease-in-out ${
        isActive
          ? "bg-brand-deep text-dark-primary"
          : "text-dark-secondary hover:text-dark-primary"
      }`}
    >
      <NavLink to={`/${path}`} onClick={() => setShowNavigation(false)}>
        <div className="flex gap-[12px] items-center">
          <div className="flex gap-[4px] items-center">
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

const NewBadge = () => (
  <div className="bg-brand p-[4px] flex rounded-[2px]">
    <L2 className="font-bold text-dark">NEW</L2>
  </div>
);

const AirdropBadge = () => (
  <div className="bg-brand p-[4px] flex items-center gap-[4px] rounded-[2px]">
    <Parachute />
    <L2 className="font-bold text-dark">AIRDROP</L2>
  </div>
);

const RewardsBadge = () => (
  <div className="bg-[#FF75C8] p-[4px] flex items-center gap-[4px] rounded-[2px]">
    <Stark width="10px" height="10px" />
    <L2 className="font-bold text-dark">REWARDS</L2>
  </div>
);

export const Navigation = () => {
  // const isMobile = useIsMobile();
  // const showNavigation = useShowNavigation();

  // const containerClass = !isMobile
  //   ? styles.container
  //   : showNavigation
  //   ? `${styles.container} ${styles.mobile}`
  //   : `${styles.container} ${styles.mobile} ${styles.hidden}`;

  const current = window.location.pathname.split("/")[1];

  return (
    <div className="w-[200px] h-inherit box-border bg-dark-container border-dark-tertiary border-r-[1px] px-[20px] py-[80px]">
      <nav className="w-[160px] flex flex-col gap-[50px]">
        <ul className="flex flex-col gap-[12px]">
          <Nav
            title="Portfolio"
            path="portfolio"
            icon={Wallet}
            isActive={current === "portfolio"}
            badge={<AirdropBadge />}
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
            badge={<NewBadge />}
            isActive={current === "priceprotect"}
          />
          <Nav
            title="Yield"
            path="yield"
            icon={Subtract}
            isActive={current === "yield"}
            badge={<RewardsBadge />}
          />
          <Nav
            title="Swap"
            path="swap"
            icon={ShuffleAngular}
            isActive={current === "swap"}
          />
          <Nav
            title="Rewards"
            path="rewards"
            icon={Sword}
            isActive={current === "rewards"}
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
            badge={<NewBadge />}
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
