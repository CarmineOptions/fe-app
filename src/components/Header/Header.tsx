import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";
import { setShowNavigation } from "../../redux/actions";
import { WalletButton } from "../ConnectWallet/Button";

import styles from "./header.module.css";

export const Header = () => {
  const isMobile = useIsMobile();
  const showNavigation = useShowNavigation();

  const handleBurgerClick = () => {
    setShowNavigation(!showNavigation);
  };

  return (
    <header className={styles.header}>
      {isMobile && (
        <div onClick={handleBurgerClick} className={styles.burger}>
          <div></div>
          <div></div>
          <div></div>
        </div>
      )}
      <span>Carmine</span>
      <WalletButton />
    </header>
  );
};
