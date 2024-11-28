import { TokenKey } from "../../classes/Token";
import {
  openSidebar,
  setSidebarContent,
  setSidebarWidth,
} from "../../redux/actions";
import { SidebarWidth } from "../../redux/reducers/ui";
import { Button, H6 } from "../common";
import { BtcBlackIcon, EthBlackIcon, StrkBlackIcon } from "../Icons";
import BigShield from "./BigShield.svg?react";
import { SidebarContent } from "./SidebarContent";

export const PriceGuard = () => {
  const background = "linear-gradient(267.89deg, #BA902E -1.69%, #332609 100%)";

  const handleClick = (tokenKey: TokenKey) => {
    // remove previous content
    setSidebarContent(null);
    // wait for the content to be removed
    setTimeout(() => {
      setSidebarContent(<SidebarContent initialTokenKey={tokenKey} />);
      setSidebarWidth(SidebarWidth.PriceProtect);
      openSidebar();
    }, 0);
  };

  return (
    <div
      className="relative rounded-sm flex flex-col gap-6 p-6"
      style={{ background }}
    >
      <H6 className="font-semibold">
        Safeguard your holdings from major price movement
      </H6>
      <div className="flex gap-4">
        <Button
          type="primary"
          className="h-11 normal-case"
          onClick={() => handleClick(TokenKey.ETH)}
        >
          <div className="flex items-center gap-4">
            <EthBlackIcon width="20px" height="20px" className="fill-black" />
            Protect ETH
          </div>
        </Button>
        <Button
          type="primary"
          className="h-11 normal-case"
          onClick={() => handleClick(TokenKey.BTC)}
        >
          <div className="flex items-center gap-4">
            <BtcBlackIcon width="20px" height="20px" className="fill-black" />
            Protect wBTC
          </div>
        </Button>
        <Button
          type="primary"
          className="h-11 normal-case"
          onClick={() => handleClick(TokenKey.STRK)}
        >
          <div className="flex items-center gap-4">
            <StrkBlackIcon width="20px" height="20px" className="fill-black" />
            Protect STRK
          </div>
        </Button>
      </div>
      <BigShield
        height="100%"
        className="hidden lg:block absolute top-0 right-0 bottom-0"
      />
    </div>
  );
};
