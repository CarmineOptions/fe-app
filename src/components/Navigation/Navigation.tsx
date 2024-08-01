import { NavLink } from "react-router-dom";
import { ReactComponent as MenuIcon } from "./menu-item.svg";

import styles from "./nav.module.css";

export const Navigation = () => {
  return (
    <div className={styles.container}>
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
                <NavLink to="/staking">
                  <MenuIcon /> Yield
                </NavLink>
              </li>
              <li>
                <NavLink to="/trade">
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
