import { NavLink } from "react-router-dom";
import { ReactComponent as MenuIcon } from "./menu-item.svg";

import styles from "./nav.module.css";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";

const Title = ({ title, newBadge }: { title: string; newBadge?: boolean }) => (
  <div className={styles.navlinktitle}>
    <div>
      <MenuIcon />
      <span>{title}</span>
    </div>
    {newBadge && <div className={styles.badge}>NEW</div>}
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
            <ul className={styles.top}>
              <li>
                <NavLink to="/portfolio">
                  <Title title="Portfolio" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/trade">
                  <Title title="Options" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/yield">
                  <Title title="Yield" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/priceprotect">
                  <Title title="Price Protect" newBadge={true} />
                </NavLink>
              </li>
              <li>
                <NavLink to="/battlecharts">
                  <Title title="Battlecharts" newBadge={true} />
                </NavLink>
              </li>
              <li>
                <NavLink to="/swap">
                  <Title title="Swap" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/rewards">
                  <Title title="Rewards" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/leaderboard">
                  <Title title="Leaderboard" />
                </NavLink>
              </li>
              <li>
                <NavLink to="/governance">
                  <Title title="Governance" />
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
