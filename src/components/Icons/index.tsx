import { CSSProperties } from "react";
import BraavosIcon from "./braavos_icon.svg?react";
import LogoLong from "./LogoLong.svg?react";
import LogoShort from "./LogoShort.svg?react";
import Medal from "./Medal.svg?react";
import Scroll from "./Scroll.svg?react";
import ShieldPlus from "./ShieldPlus.svg?react";
import ShuffleAngular from "./ShuffleAngular.svg?react";
import Strategy from "./Strategy.svg?react";
import Subtract from "./Subtract.svg?react";
import Sword from "./Sword.svg?react";
import VerticalDots from "./DotsThreeVertical.svg?react";
import Wallet from "./Wallet.svg?react";
import BlackWallet from "./blackWallet.svg?react";
import WhiteWallet from "./whiteWallet.svg?react";

const StarknetIcon = ({ style }: { style?: CSSProperties }) => (
  <img style={style} src="/starknet.webp" alt="Starknet Logo" />
);

export {
  BlackWallet,
  WhiteWallet,
  BraavosIcon,
  StarknetIcon,
  LogoLong,
  LogoShort,
  Medal,
  Scroll,
  ShieldPlus,
  ShuffleAngular,
  Strategy,
  Subtract,
  Sword,
  VerticalDots,
  Wallet,
};
