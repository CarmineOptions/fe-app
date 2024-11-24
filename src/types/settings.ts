import { NetworkName } from "./network";

export interface Settings {
  autoconnect: boolean;
  network: NetworkName;
  slippage: number;
}
