import { NavLink } from "react-router-dom";
import { ReactComponent as MenuIcon } from "./menu-item.svg";

import styles from "./nav.module.css";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";

const NewTitle = ({ title }: { title: string }) => (
  <div className={styles.rewardsheader}>
    <div className={styles.badge}>NEW</div> {title}
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

  return (
    <div className={containerClass}>
      <aside className={styles.sidebar}>
        <div>
          <nav className={styles.primary}>
            <ul>
              <li>
                <NavLink to="/portfolio">
                  <MenuIcon /> Portfolio
                </NavLink>
              </li>
              <li>
                <NavLink to="/trade">
                  <MenuIcon /> Options
                </NavLink>
              </li>
              <li>
                <NavLink to="/yield">
                  <MenuIcon /> Yield
                </NavLink>
              </li>
              <li>
                <NavLink to="/priceprotect">
                  <NewTitle title="Price Protect" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/battlecharts">
                  <NewTitle title="Battlecharts" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/swap">
                  <MenuIcon /> Swap
                </NavLink>
              </li>
              <li>
                <NavLink to="/rewards">
                  <MenuIcon /> Rewards
                </NavLink>
              </li>
              <li>
                <NavLink to="/leaderboard">
                  <MenuIcon /> Leaderboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/governance">
                  <MenuIcon /> Governance
                </NavLink>
              </li>
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
