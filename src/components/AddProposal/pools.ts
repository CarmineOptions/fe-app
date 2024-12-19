import { Pool } from "../../classes/Pool";
import {
  STRK_ADDRESS,
  USDC_ADDRESS,
  ETH_ADDRESS,
  BTC_ADDRESS,
  EKUBO_ADDRESS,
} from "../../constants/amm";
import { OptionType } from "../../types/options";

export const pools = [
  new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Put),
  new Pool(ETH_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(ETH_ADDRESS, USDC_ADDRESS, OptionType.Put),
  new Pool(EKUBO_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(EKUBO_ADDRESS, USDC_ADDRESS, OptionType.Put),
  new Pool(ETH_ADDRESS, STRK_ADDRESS, OptionType.Call),
  new Pool(ETH_ADDRESS, STRK_ADDRESS, OptionType.Put),
  new Pool(BTC_ADDRESS, USDC_ADDRESS, OptionType.Call),
  new Pool(BTC_ADDRESS, USDC_ADDRESS, OptionType.Put),
];
