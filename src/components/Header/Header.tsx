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

  return (
    <header className="py-[12px] px-[28px] flex justify-between items-center bg-dark-container border-dark-tertiary border-b-[1px]">
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
