import { useNavigate } from "react-router-dom";
import { useShowNavigation } from "../../hooks/useShowNavigation";
import { WalletButton } from "../ConnectWallet/Button";
import { LogoLong } from "../Icons";
import { setShowNavigation } from "../../redux/actions";
import MobileLogo from "./MobileLogo.svg?react";

export const Header = () => {
  const isOpen = useShowNavigation();
  const navigate = useNavigate();

  const handleMobileMenuClick = () => {
    console.log("HEADER", isOpen);
    setShowNavigation(!isOpen);
  };

  return (
    <header className="py-[12px] px-[28px] flex justify-between items-center bg-dark-container border-dark-tertiary border-b-[1px]">
      <div
        onClick={handleMobileMenuClick}
        className="md:hidden flex items-center cursor-pointer"
      >
        <MobileLogo />
      </div>
      <div
        className="hidden md:flex items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <LogoLong />
      </div>
      <WalletButton />
    </header>
  );
};
