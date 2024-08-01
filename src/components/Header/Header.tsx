import { WalletButton } from "../ConnectWallet/Button";

import styles from "./header.module.css";

export const Header = () => (
  <header className={styles.header}>
    <span>Carmine</span>
    <WalletButton />
  </header>
);
