import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { WalletButton } from "../ConnectWallet/Button";
import { LinksMenu } from "../LinksMenu/LinksMenu";
import { NetworkSwitch } from "../NetworkSwitch/NetworkSwitch";
import { StarknetIcon } from "../Icons";

import styles from "./header.module.css";

type NavLinkProps = {
  title: string;
  link: string;
};

const navLinks = [
  {
    title: "Staking",
    link: "/staking",
  },
  {
    title: "Insurance",
    link: "/insurance",
  },
  {
    title: "Trade",
    link: "/trade",
  },
  {
    title: "Portfolio",
    link: "/portfolio",
  },
  {
    title: "Leaderboard",
    link: "/leaderboard",
  },
  {
    title: "Rewards",
    link: "/rewards",
  },
] as NavLinkProps[];

const RewardsTitle = () => (
  <div className={styles.rewardsheader}>
    <StarknetIcon style={{ width: "32px", height: "32px" }} /> Rewards
  </div>
);

const navLink = ({ title, link }: NavLinkProps, i: number): ReactNode => (
  <NavLink
    className={(p) => {
      const active = `${styles.navlink} ${styles.active}`;
      const nonActive = styles.navlink;

      // "/" is "/staking"
      if (window.location.pathname === "/" && link === "/staking") {
        return active;
      }

      return p.isActive ? active : nonActive;
    }}
    to={link}
    key={i}
  >
    {title === "Rewards" ? <RewardsTitle /> : title}
  </NavLink>
);

export const Header = () => (
  <header className={styles.header}>
    <div className={styles.navlinkcontainer}>
      <NavLink to="/" className={styles.logo}>
        <img height="52px" src="/logo.png" alt="Carmine logo" />
      </NavLink>
      <NetworkSwitch />
      {navLinks.map((navData, i) => navLink(navData, i))}
      <LinksMenu />
      <WalletButton />
    </div>
  </header>
);
