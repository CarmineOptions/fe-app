import { NavLink } from "react-router-dom";

import About from "./icons/about.svg?react";
import Developers from "./icons/developers.svg?react";
import Discord from "./icons/discord.svg?react";
import Docs from "./icons/documentation.svg?react";
import Github from "./icons/github.svg?react";
import Home from "./icons/home.svg?react";
import Settings from "./icons/settings.svg?react";
import Twitter from "./icons/twitter.svg?react";

import styles from "./linksmenu.module.css";

type Props = {
  handleClose: () => void;
};

export const MenuContent = ({ handleClose }: Props) => {
  return (
    <div className={styles.container}>
      <div style={{ borderBottom: "1px solid white" }}>
        <NavLink className={styles.homelink} to="/" onClick={handleClose}>
          <div className={styles.iconholder}>
            <Home />
          </div>
          Home
        </NavLink>
        <NavLink
          className={styles.homelink}
          to="/settings"
          onClick={handleClose}
        >
          <div className={styles.iconholder}>
            <Settings />
          </div>
          Settings
        </NavLink>
        <NavLink
          className={styles.homelink}
          to="/governance"
          onClick={handleClose}
        >
          <div className={styles.iconholder}>
            <Developers />
          </div>
          Governance
        </NavLink>
        <a
          href="https://legacy.app.carmine.finance"
          target="_blank"
          rel="noreferrer"
          className={styles.homelink}
        >
          <div className={styles.iconholder}>
            <Developers />
          </div>
          Legacy App
        </a>
      </div>
      <div className={styles.stack}>
        <a
          href="https://www.carmine.finance/for-builders"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.iconholder}>
            <Developers />
          </div>
          Developers
        </a>
        <a
          href="https://docs.carmine.finance/carmine-options-amm/"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.iconholder}>
            <Docs />
          </div>
          Documentation
        </a>
        <a
          href="https://carmine.finance/about"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.iconholder}>
            <About />
          </div>
          About
        </a>
        <a
          href="https://github.com/CarmineOptions"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.iconholder}>
            <Github />
          </div>
          Github
        </a>
        <a
          href="https://discord.gg/uRs7j8w3bX"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.iconholder}>
            <Discord />
          </div>
          Discord
        </a>
        <a
          href="https://twitter.com/CarmineOptions"
          target="_blank"
          rel="noreferrer"
        >
          <div className={styles.iconholder}>
            <Twitter />
          </div>
          Twitter
        </a>
      </div>
    </div>
  );
};
