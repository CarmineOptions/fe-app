import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";
import { setShowNavigation } from "../../redux/actions";
import { WalletButton } from "../ConnectWallet/Button";
import { ReactComponent as Carmine } from "./Carmine.svg";
import styles from "./header.module.css";

export const Header = () => {
  const isMobile = useIsMobile();
  const showNavigation = useShowNavigation();
  const navigate = useNavigate();

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
      <div className={styles.logocontainer} onClick={() => navigate("/")}>
        <Carmine />
      </div>
      <WalletButton />
    </header>
  );
};
