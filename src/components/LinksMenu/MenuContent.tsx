import styles from "./linksmenu.module.css";
import { NavLink } from "react-router-dom";
import { ReactComponent as Developers } from "./icons/developers.svg";
import { ReactComponent as Discord } from "./icons/discord.svg";
import { ReactComponent as Home } from "./icons/home.svg";
import { ReactComponent as Docs } from "./icons/documentation.svg";
import { ReactComponent as About } from "./icons/about.svg";
import { ReactComponent as Settings } from "./icons/settings.svg";
import { ReactComponent as Github } from "./icons/github.svg";
import { ReactComponent as Twitter } from "./icons/twitter.svg";

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
      </div>
      <div className={styles.stack}>
        <a
          href="https://carmine.finance/developers"
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
        <NavLink to="/settings" onClick={handleClose}>
          <div className={styles.iconholder}>
            <Settings />
          </div>
          Settings
        </NavLink>
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
