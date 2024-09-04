import { CSSProperties } from "react";
import { ReactComponent as LogoLong } from "./LogoLong.svg";
import { ReactComponent as Medal } from "./Medal.svg";
import { ReactComponent as Scroll } from "./Scroll.svg";
import { ReactComponent as ShieldPlus } from "./ShieldPlus.svg";
import { ReactComponent as ShuffleAngular } from "./ShuffleAngular.svg";
import { ReactComponent as Strategy } from "./Strategy.svg";
import { ReactComponent as Subtract } from "./Subtract.svg";
import { ReactComponent as Sword } from "./Sword.svg";
import { ReactComponent as Wallet } from "./Wallet.svg";

const StarknetIcon = ({ style }: { style?: CSSProperties }) => (
  <img style={style} src="/starknet.webp" alt="Starknet Logo" />
);

export {
  StarknetIcon,
  LogoLong,
  Medal,
  Scroll,
  ShieldPlus,
  ShuffleAngular,
  Strategy,
  Subtract,
  Sword,
  Wallet,
};
