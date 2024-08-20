import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { WalletButton } from "../ConnectWallet/Button";
import { LinksMenu } from "../LinksMenu/LinksMenu";
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
    title: "Price Protect",
    link: "/priceprotect",
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
  {
    title: "Battlecharts",
    link: "/battlecharts",
  },
] as NavLinkProps[];

const RewardsTitle = () => (
  <div className={styles.rewardsheader}>
    <StarknetIcon style={{ width: "32px", height: "32px" }} /> Rewards
  </div>
);

const NewTitle = ({ title }: { title: string }) => (
  <div className={styles.rewardsheader}>
    <div className={styles.badge}>NEW</div> {title}
  </div>
);

const navLink = ({ title, link }: NavLinkProps, i: number): ReactNode => (
  <NavLink
    className={(p) => {
      const active = `${styles.navlink} ${styles.active}`;
      const nonActive = styles.navlink;

      // "/" is "/trade"
      if (window.location.pathname === "/" && link === "/trade") {
        return active;
      }

      return p.isActive ? active : nonActive;
    }}
    to={link}
    key={i}
  >
    {title === "Rewards" ? (
      <RewardsTitle />
    ) : title === "Battlecharts" ? (
      <NewTitle title={title} />
    ) : (
      title
    )}
  </NavLink>
);

export const Header = () => (
  <header className={styles.header}>
    <div className={styles.navlinkcontainer}>
      <NavLink to="/" className={styles.logo}>
        <img height="52px" src="/logo.png" alt="Carmine logo" />
      </NavLink>
      {navLinks.map((navData, i) => navLink(navData, i))}
      <LinksMenu />
      <WalletButton />
    </div>
  </header>
);
