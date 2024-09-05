import { FunctionComponent, ReactNode, SVGProps } from "react";

import { NavLink } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";
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

import styles from "./nav.module.css";

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
    <li className={isActive ? styles.active : ""}>
      <NavLink to={`/${path}`}>
        <div className={styles.navlinktitle}>
          <div>
            <Icon
              style={{ stroke: isActive ? "var(--WHITE)" : "var(--SECONDARY)" }}
            />
            <p
              className={`regular secondary-col${isActive ? " white-col" : ""}`}
            >
              {title}
            </p>
          </div>
          {badge !== undefined && badge}
        </div>
      </NavLink>
    </li>
  );
};

const NewBadge = () => (
  <div className={styles.badge}>
    <span className="l2 bold black-col">NEW</span>
  </div>
);

export const Navigation = () => {
  const isMobile = useIsMobile();
  const showNavigation = useShowNavigation();

  const containerClass = !isMobile
    ? styles.container
    : showNavigation
    ? `${styles.container} ${styles.mobile}`
    : `${styles.container} ${styles.mobile} ${styles.hidden}`;

  const current = window.location.pathname.split("/")[1];

  return (
    <div className={containerClass}>
      <aside className={styles.sidebar}>
        <div>
          <nav className={styles.primary}>
            <ul className={styles.top}>
              <Nav
                title="Portfolio"
                path="portfolio"
                icon={Wallet}
                isActive={current === "portfolio"}
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
                badge={<NewBadge />}
                isActive={current === "battlecharts"}
              />
            </ul>
          </nav>
        </div>
        <div>
          <nav className={`${styles.secondary} ${styles.topborder}`}>
            <ul>
              <li>
                <a href="https://docs.carmine.finance/carmine-options-amm/audit">
                  Audits
                </a>
              </li>
              <li>
                <a href="https://legacy.app.carmine.finance">Legacy App</a>
              </li>
            </ul>
          </nav>
          <nav className={`${styles.secondary} ${styles.topborder}`}>
            <ul>
              <li>
                <a href="https://twitter.com/CarmineOptions">Twitter</a>
              </li>
              <li>
                <a href="https://discord.gg/uRs7j8w3bX">Discord</a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
};
