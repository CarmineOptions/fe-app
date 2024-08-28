import { NavLink } from "react-router-dom";
import { ReactComponent as MenuIcon } from "./menu-item.svg";

import styles from "./nav.module.css";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";

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
                  <MenuIcon /> Price Protect
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
                <NavLink to="/audits">Audits</NavLink>
              </li>
              <li>
                <a href="https://legacy.app.carmine.finance">Legacy App</a>
              </li>
            </ul>
          </nav>
          <nav className={`${styles.secondary} ${styles.topborder}`}>
            <ul>
              <li>
                <a href="https://www.carmine.finance">Blog</a>
              </li>
              <li>
                <a href="https://www.carmine.finance">Twitter</a>
              </li>
              <li>
                <a href="https://www.carmine.finance">Discord</a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
};
