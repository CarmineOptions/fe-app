import { BigNumberish, Call } from "starknet";

import {
  AMM_ADDRESS,
  AMM_METHODS,
  BTC_ADDRESS,
  EKUBO_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../constants/amm";
import {
  BtcIcon,
  EkuboIcon,
  EthIcon,
  StrkIcon,
  UsdcIcon,
} from "../components/Icons";
import { FunctionComponent, SVGProps } from "react";

export enum TokenKey {
  ETH = "eth",
  USDC = "usdc",
  BTC = "btc",
  STRK = "strk",
  EKUBO = "ekubo",
}

const TOKENS: [TokenKey, string, number, string, string][] = [
  [
    TokenKey.ETH,
    "ETH",
    18,
    ETH_ADDRESS,
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  ],
  [
    TokenKey.USDC,
    "USDC",
    6,
    USDC_ADDRESS,
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  ],
  [
    TokenKey.BTC,
    "wBTC",
    8,
    BTC_ADDRESS,
    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  ],
  [
    TokenKey.STRK,
    "STRK",
    18,
    STRK_ADDRESS,
    "https://assets.coingecko.com/coins/images/26433/small/starknet.png",
  ],
  [
    TokenKey.EKUBO,
    "EKUBO",
    18,
    EKUBO_ADDRESS,
    "https://assets.coingecko.com/coins/images/37715/standard/135474885.png",
  ],
];

const tokenKeyToIcon = (
  key: TokenKey
): FunctionComponent<SVGProps<SVGSVGElement>> => {
  if (key === TokenKey.BTC) {
    return BtcIcon;
  }
  if (key === TokenKey.ETH) {
    return EthIcon;
  }
  if (key === TokenKey.STRK) {
    return StrkIcon;
  }
  if (key === TokenKey.USDC) {
    return UsdcIcon;
  }
  if (key === TokenKey.EKUBO) {
    return EkuboIcon;
  }
  throw Error("Invalid token key");
};

export class Token {
  private _id: TokenKey;
  private _symbol: string;
  private _decimals: number;
  private _address: string;
  private _icon: FunctionComponent<SVGProps<SVGSVGElement>>;

  static instances = TOKENS.map(
    (args) => new Token(args[0], args[1], args[2], args[3])
  );

  private constructor(
    id: TokenKey,
    symbol: string,
    decimals: number,
    address: string
  ) {
    this._id = id;
    this._symbol = symbol;
    this._decimals = decimals;
    this._address = address;
    this._icon = tokenKeyToIcon(id);
  }

  static byKey(key: TokenKey): Token {
    const match = this.instances.find((token) => token.id === key);
    if (match) {
      return match;
    }
    // unreachable
    throw new Error(`Token "${key}" does not exist`);
  }

  static byAddress(address: BigNumberish): Token {
    const bigIntAddress = BigInt(address);

    const match = this.instances.find(
      (token) => BigInt(token.address) === bigIntAddress
    );

    if (match) {
      return match;
    }

    // unreachable
    throw new Error(`Token with address "${address}" does not exist`);
  }

  approveCalldata(amount: BigNumberish): Call {
    return {
      contractAddress: this.address,
      entrypoint: AMM_METHODS.APPROVE,
      calldata: [AMM_ADDRESS, BigInt(amount).toString(10), "0"],
    };
  }

  // GETTERS
  get id(): TokenKey {
    return this._id;
  }

  get symbol(): string {
    return this._symbol;
  }

  get decimals(): number {
    return this._decimals;
  }

  get address(): string {
    return this._address;
  }

  get icon(): FunctionComponent<SVGProps<SVGSVGElement>> {
    return this._icon;
  }
}

export const EthToken = Token.byKey(TokenKey.ETH);
export const StrkToken = Token.byKey(TokenKey.STRK);
export const UsdcToken = Token.byKey(TokenKey.USDC);
export const BtcToken = Token.byKey(TokenKey.BTC);
export const EkuboToken = Token.byKey(TokenKey.EKUBO);
