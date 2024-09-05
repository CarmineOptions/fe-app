import { useNavigate } from "react-router-dom";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useShowNavigation } from "../../hooks/useShowNavigation";
import { setShowNavigation } from "../../redux/actions";
import { WalletButton } from "../ConnectWallet/Button";
import { LogoLong, LogoShort, VerticalDots } from "../Icons";

import styles from "./header.module.css";

export const Header = () => {
  const isMobile = useIsMobile();
  const showNavigation = useShowNavigation();
  const navigate = useNavigate();

  const handleMobileMenuClick = () => {
    setShowNavigation(!showNavigation);
  };

  const container = isMobile
    ? styles.header + " " + styles.mobile
    : styles.header;

  return (
    <header className={container}>
      {isMobile ? (
        <div onClick={handleMobileMenuClick} className={styles.mobilemenu}>
          <div>
            <VerticalDots />
          </div>
          <div>
            <LogoShort />
          </div>
        </div>
      ) : (
        <div className={styles.logocontainer} onClick={() => navigate("/")}>
          <LogoLong />
        </div>
      )}

      <WalletButton />
    </header>
  );
};
