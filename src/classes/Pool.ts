import { BigNumberish, Call } from "starknet";

import { sendGtagEvent } from "../analytics";
import { getUnlockedCapital } from "../calls/getUnlockedCapital";
import {
  AMM_ADDRESS,
  AMM_METHODS,
  BASE_DIGITS,
  BTC_USDC_CALL_ADDRESS,
  BTC_USDC_PUT_ADDRESS,
  ETH_STRK_CALL_ADDRESS,
  ETH_STRK_PUT_ADDRESS,
  ETH_USDC_CALL_ADDRESS,
  ETH_USDC_PUT_ADDRESS,
  STRK_USDC_CALL_ADDRESS,
  STRK_USDC_PUT_ADDRESS,
} from "../constants/amm";
import { getMultipleTokensValueInUsd } from "../tokens/tokenPrices";
import { OptionType } from "../types/options";
import { shortInteger } from "../utils/computations";
import { bnToOptionType } from "../utils/conversions";
import { toHex } from "../utils/utils";
import { Pair, PairKey } from "./Pair";
import { Token, TokenKey } from "./Token";

export class Pool extends Pair {
  public type: OptionType;
  public lpAddress: string;
  public poolId: string;
  public apiPoolId: string;

  constructor(base: BigNumberish, quote: BigNumberish, type: BigNumberish) {
    super(base, quote);
    this.type = bnToOptionType(type);
    this.poolId = this.generateId();

    switch (this.pairId + this.type) {
      case PairKey.ETH_USDC + OptionType.Call:
        this.lpAddress = ETH_USDC_CALL_ADDRESS;
        this.apiPoolId = "eth-usdc-call";

        break;
      case PairKey.ETH_USDC + OptionType.Put:
        this.lpAddress = ETH_USDC_PUT_ADDRESS;
        this.apiPoolId = "eth-usdc-put";

        break;
      case PairKey.BTC_USDC + OptionType.Call:
        this.lpAddress = BTC_USDC_CALL_ADDRESS;
        this.apiPoolId = "btc-usdc-call";

        break;
      case PairKey.BTC_USDC + OptionType.Put:
        this.lpAddress = BTC_USDC_PUT_ADDRESS;
        this.apiPoolId = "btc-usdc-put";

        break;
      case PairKey.ETH_STRK + OptionType.Call:
        this.lpAddress = ETH_STRK_CALL_ADDRESS;
        this.apiPoolId = "eth-strk-call";

        break;
      case PairKey.ETH_STRK + OptionType.Put:
        this.lpAddress = ETH_STRK_PUT_ADDRESS;
        this.apiPoolId = "eth-strk-put";

        break;
      case PairKey.STRK_USDC + OptionType.Call:
        this.lpAddress = STRK_USDC_CALL_ADDRESS;
        this.apiPoolId = "strk-usdc-call";

        break;
      case PairKey.STRK_USDC + OptionType.Put:
        this.lpAddress = STRK_USDC_PUT_ADDRESS;
        this.apiPoolId = "strk-usdc-put";

        break;
      default:
        throw Error(
          `Invalid Pool ${this.baseToken.id + this.quoteToken.id + this.type}`
        );
    }
  }

  /**
   * Generates id that uniquily describes pool
   */
  generateId(): string {
    return JSON.stringify([
      BigInt(this.baseToken.address).toString(36),
      BigInt(this.quoteToken.address).toString(36),
      BigInt(this.type).toString(10),
    ]);
  }

  eq(other: Pool): boolean {
    return this.poolId === other.poolId;
  }

  isType(type: OptionType): boolean {
    return this.type === type;
  }

  async tokenPricesInUsd() {
    const [base, quote] = await getMultipleTokensValueInUsd([
      this.baseToken.id,
      this.quoteToken.id,
    ]);
    return { base, quote };
  }

  async getUnlocked() {
    return getUnlockedCapital(this.lpAddress);
  }

  isPair(key: PairKey): boolean {
    return this.pairId === key;
  }

  private _depositWithdrawCalldata(amount: BigNumberish): BigNumberish[] {
    return [
      this.underlying.address,
      this.quoteToken.address,
      this.baseToken.address,
      this.type,
      BigInt(amount).toString(10),
      "0", // uint256 0
    ];
  }

  depositLiquidityCalldata(amount: BigNumberish): Call {
    return {
      contractAddress: AMM_ADDRESS,
      entrypoint: AMM_METHODS.DEPOSIT_LIQUIDITY,
      calldata: this._depositWithdrawCalldata(amount),
    };
  }

  withdrawLiquidityCalldata(amount: BigNumberish): Call {
    return {
      contractAddress: AMM_ADDRESS,
      entrypoint: AMM_METHODS.WITHDRAW_LIQUIDITY,
      calldata: this._depositWithdrawCalldata(amount),
    };
  }

  sendStakeBeginCheckoutEvent(size: number) {
    const params = {
      event_category: "staking",
      event_label: "stake button clicked",
      type: this.typeAsText,
      pair: this.pairId,
      size,
    };
    sendGtagEvent("begin_checkout", params);
  }

  sendStakePurchaseEvent(size: number) {
    const params = {
      event_category: "staking",
      event_label: "confirmed in wallet",
      type: this.typeAsText,
      pair: this.pairId,
      size,
    };
    sendGtagEvent("purchase", params);
  }

  ////////////
  // GETTERS
  ////////////

  get typeAsText(): string {
    return this.type === OptionType.Call ? "Call" : "Put";
  }

  get isCall(): boolean {
    return this.type === OptionType.Call;
  }

  get isPut(): boolean {
    return this.type === OptionType.Put;
  }

  get underlying(): Token {
    return this.isCall ? this.baseToken : this.quoteToken;
  }

  get digits(): number {
    // call has base decimals, put has quote decimals
    return this.underlying.decimals;
  }

  // Address of the underlying token
  get tokenAddress(): string {
    return this.underlying.address;
  }

  get symbol(): string {
    return this.underlying.symbol;
  }

  get name(): string {
    return `${this.baseToken.symbol}/${this.quoteToken.symbol} ${this.typeAsText} Pool (${this.symbol})`;
  }

  get strikeStep(): [number, number] {
    if (
      this.baseToken.id === TokenKey.ETH &&
      this.quoteToken.id === TokenKey.USDC
    ) {
      // ETH/USDC
      return [100, 200];
    }
    if (
      this.baseToken.id === TokenKey.STRK &&
      this.quoteToken.id === TokenKey.USDC
    ) {
      // STRK/USDC
      return [0.05, 0.05];
    }
    if (
      this.baseToken.id === TokenKey.ETH &&
      this.quoteToken.id === TokenKey.STRK
    ) {
      // ETH/STRK
      return [100, 300];
    }
    if (
      this.baseToken.id === TokenKey.BTC &&
      this.quoteToken.id === TokenKey.USDC
    ) {
      // BTC/USDC
      return [1000, 3000];
    }

    // unreachable
    throw Error("Failed getting strike step");
  }

  get baseVolatility(): number {
    if (
      this.baseToken.id === TokenKey.ETH &&
      this.quoteToken.id === TokenKey.USDC
    ) {
      // ETH/USDC
      return 55;
    }
    if (
      this.baseToken.id === TokenKey.STRK &&
      this.quoteToken.id === TokenKey.USDC
    ) {
      // STRK/USDC
      return 90;
    }
    if (
      this.baseToken.id === TokenKey.ETH &&
      this.quoteToken.id === TokenKey.STRK
    ) {
      // ETH/STRK
      return 100;
    }
    if (
      this.baseToken.id === TokenKey.BTC &&
      this.quoteToken.id === TokenKey.USDC
    ) {
      // BTC/USDC
      return 55;
    }

    // unreachable
    throw Error("Failed getting base volatility");
  }
}

export class PoolInfo extends Pool {
  public stakedHex: string;
  public stakedBase: bigint;
  public unlockedHex: string;
  public unlockedBase: bigint;
  public poolPositionHex: string;
  public poolPositionBase: bigint;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    staked: BigNumberish,
    unlocked: BigNumberish,
    poolPosition: BigNumberish
  ) {
    super(base, quote, type);

    this.stakedHex = toHex(staked);
    this.unlockedHex = toHex(unlocked);
    this.poolPositionHex = toHex(poolPosition);

    this.stakedBase = BigInt(staked);
    this.unlockedBase = BigInt(unlocked);
    this.poolPositionBase = BigInt(poolPosition);
  }
}

export class UserPoolInfo extends Pool {
  public valueHex: string;
  public valueBase: bigint;
  public value: number;
  public sizeHex: string;
  public sizeBase: bigint;
  public size: number;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    size: BigNumberish,
    value: BigNumberish
  ) {
    super(base, quote, type);
    this.sizeHex = toHex(size);
    this.sizeBase = BigInt(size);
    // size is in LP digits - always 18
    this.size = shortInteger(this.sizeHex, BASE_DIGITS);
    this.valueHex = toHex(value);
    this.valueBase = BigInt(value);
    // value is in digits by type
    this.value = shortInteger(this.valueHex, this.digits);
  }
}
