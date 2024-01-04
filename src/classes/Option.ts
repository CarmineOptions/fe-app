import { BigNumberish, Call } from "starknet";

import { sendGtagEvent } from "../analytics";
import { AMM_ADDRESS, AMM_METHODS, BASE_MATH_64 } from "../constants/amm";
import { FinancialData, OptionSide, OptionStruct } from "../types/options";
import { Cubit } from "../types/units";
import { longInteger, shortInteger } from "../utils/computations";
import { bnToOptionSide } from "../utils/conversions";
import { timestampToReadableDate, timestampToShortTimeDate, toHex } from "../utils/utils";
import { Pool } from "./Pool";

export class Option extends Pool {
  public maturity: number;
  public maturityHex: string;
  public strike: number;
  public strikeHex: string;
  public side: OptionSide;
  public optionId: string;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    side: BigNumberish,
    maturity: BigNumberish,
    strike: bigint | number
  ) {
    super(base, quote, type);

    this.maturityHex = toHex(maturity);
    this.maturity = Number(BigInt(maturity));
    this.strikeHex = toHex(
      typeof strike === "bigint" ? strike : BigInt(strike) * BASE_MATH_64
    );
    this.strike =
      typeof strike === "number" ? strike : Number(strike / BASE_MATH_64);

    this.side = bnToOptionSide(side);
    this.optionId = this.generateId();
  }

  /**
   * Generates id that uniquily describes option
   */
  generateId(): string {
    return JSON.stringify({
      base: this.baseToken.id,
      quote: this.quoteToken.id,
      type: this.type,
      side: this.side,
      maturity: this.maturity,
      strike: this.strike,
    });
  }

  tradeCalldata(size: number | string): string[] {
    // base token digits
    const convertedSize =
      typeof size === "string"
        ? // string is for full size closing
          size
        : longInteger(size, this.baseToken.decimals).toString(10);
    return [
      this.type,
      this.strikeHex, // cubit
      "0", // cubit - false
      this.maturityHex,
      this.side,
      convertedSize,
      this.quoteToken.address,
      this.baseToken.address,
    ];
  }

  addPosition(size: BigNumberish, value: BigNumberish): OptionWithPosition {
    return new OptionWithPosition(
      this.baseToken.address,
      this.quoteToken.address,
      this.type,
      this.side,
      this.maturity,
      this.strike,
      size,
      value
    );
  }

  addPremia(premia: BigNumberish): OptionWithPremia {
    return new OptionWithPremia(
      this.baseToken.address,
      this.quoteToken.address,
      this.type,
      this.side,
      this.maturity,
      this.strike,
      premia
    );
  }

  isSide(side: OptionSide): boolean {
    return this.side === side;
  }

  financialDataCall(
    size: number,
    // premia is in base token
    premia: number,
    price: number
  ): FinancialData {
    const premiaUsd = premia * price;
    const sizeOnePremiaUsd = premiaUsd / size;
    const sizeOnePremia = premia / size;

    return {
      premiaUsd,
      sizeOnePremiaUsd,
      premia,
      sizeOnePremia,
    };
  }

  financialDataPut(
    size: number,
    // premia is in quote token
    premia: number,
    price: number
  ): FinancialData {
    const premiaUsd = premia * price;
    const sizeOnePremiaUsd = premiaUsd / size;
    const sizeOnePremia = premia / size;

    return {
      premiaUsd,
      premia,
      sizeOnePremiaUsd,
      sizeOnePremia,
    };
  }

  financialData(
    size: number,
    premia: number,
    basePrice: number,
    quotePrice: number
  ): FinancialData {
    return this.isCall
      ? this.financialDataCall(size, premia, basePrice)
      : this.financialDataPut(size, premia, quotePrice);
  }

  _tradeOpenCloseCalldata(
    size: string | number,
    premia: BigNumberish,
    open: boolean
  ): Call {
    // one hour from now
    const deadline = String(Math.round(new Date().getTime() / 1000) + 60 * 60);

    const calldata = [
      ...this.tradeCalldata(size),
      premia.toString(10), // cubit
      "0", // cubit false
      deadline,
    ];

    return {
      contractAddress: AMM_ADDRESS,
      entrypoint: open ? AMM_METHODS.TRADE_OPEN : AMM_METHODS.TRADE_CLOSE,
      calldata,
    };
  }

  tradeOpenCalldata(size: string | number, premia: BigNumberish): Call {
    return this._tradeOpenCloseCalldata(size, premia, true);
  }

  sendViewEvent(isInsurance = false) {
    const category = isInsurance ? "insurance" : "option";
    const params = {
      event_category: category,
      event_label: "option dialog opened",
      type: this.typeAsText,
      side: this.sideAsText,
      pair: this.pairId,
      maturity: this.maturity,
      strike: this.strike,
    };
    sendGtagEvent("view_item", params);
  }

  sendBeginCheckoutEvent(size: number, premia: number, isInsurance = false) {
    const category = isInsurance ? "insurance" : "option";
    const params = {
      event_category: category,
      event_label: "buy button clicked",
      type: this.typeAsText,
      side: this.sideAsText,
      pair: this.pairId,
      maturity: this.maturity,
      strike: this.strike,
      size,
      premia,
    };
    sendGtagEvent("begin_checkout", params);
  }

  sendPurchaseEvent(size: number, premia: number, isInsurance = false) {
    const category = isInsurance ? "insurance" : "option";
    const params = {
      event_category: category,
      event_label: "confirmed in wallet",
      type: this.typeAsText,
      side: this.sideAsText,
      pair: this.pairId,
      maturity: this.maturity,
      strike: this.strike,
      size,
      premia,
    };
    sendGtagEvent("purchase", params);
  }

  ////////////
  // GETTERS
  ////////////

  get otherSideOption(): Option {
    const otherSide =
      this.side === OptionSide.Long ? OptionSide.Short : OptionSide.Long;
    return new Option(
      this.baseToken.address,
      this.quoteToken.address,
      this.type,
      otherSide,
      this.maturityHex,
      this.strike
    );
  }

  get sideAsText(): string {
    return this.side === OptionSide.Long ? "Long" : "Short";
  }

  get isLong(): boolean {
    return this.side === OptionSide.Long;
  }

  get isShort(): boolean {
    return this.side === OptionSide.Short;
  }

  get display(): string {
    return `${this.pairId} ${this.sideAsText} ${
      this.typeAsText
    } - strike price $${this.strike} - expires ${timestampToReadableDate(
      this.maturity * 1000
    )}`;
  }

  get isFresh(): boolean {
    return this.maturity * 1000 > new Date().getTime();
  }

  get isExpired(): boolean {
    return !this.isFresh;
  }

  get struct(): OptionStruct {
    return {
      option_side: this.side,
      maturity: this.maturityHex,
      strike_price: Cubit(this.strikeHex),
      quote_token_address: this.quoteToken.address,
      base_token_address: this.baseToken.address,
      option_type: this.type,
    };
  }

  get dateShort(): string {
    return timestampToShortTimeDate(this.maturity * 1000);
  }

  get dateRich(): string {
    return timestampToReadableDate(this.maturity * 1000);
  }
}

export class OptionWithPosition extends Option {
  public sizeHex: string;
  public valueHex: string;
  public size: number;
  public value: number;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    side: BigNumberish,
    maturity: BigNumberish,
    strike: bigint | number,
    size: BigNumberish,
    value: BigNumberish
  ) {
    super(base, quote, type, side, maturity, strike);

    this.sizeHex = toHex(size);
    this.valueHex = toHex(value);
    // size is Carmine token - always 18 digits
    this.size = shortInteger(this.sizeHex, this.baseToken.decimals);
    this.value =
      Number((BigInt(this.valueHex) * 1_000_000n) / BASE_MATH_64) / 1_000_000;
  }

  tradeCloseCalldata(size: string | number, premia: BigNumberish): Call {
    return this._tradeOpenCloseCalldata(size, premia, false);
  }

  tradeCloseAllCalldata(premia: BigNumberish): Call {
    return this._tradeOpenCloseCalldata(this.sizeHex, premia, false);
  }

  get tradeSettleCalldata(): Call {
    return {
      contractAddress: AMM_ADDRESS,
      entrypoint: AMM_METHODS.TRADE_SETTLE,
      calldata: this.tradeCalldata(this.sizeHex),
    };
  }

  get fullSize(): string {
    return this.sizeHex;
  }

  get isInTheMoney(): Boolean {
    return !!this.value && this.isExpired;
  }

  get isOutOfTheMoney(): Boolean {
    return !this.value && this.isExpired;
  }
}

export class OptionWithPremia extends Option {
  public premiaHex: string;
  public premia: number;
  public premiaBase: bigint;

  constructor(
    base: BigNumberish,
    quote: BigNumberish,
    type: BigNumberish,
    side: BigNumberish,
    maturity: BigNumberish,
    strike: bigint | number,
    premia: BigNumberish
  ) {
    super(base, quote, type, side, maturity, strike);

    this.premiaHex = toHex(premia);
    this.premiaBase =
      (BigInt(this.premiaHex) * 10n ** BigInt(this.digits)) / BASE_MATH_64;
    this.premia = shortInteger(this.premiaBase, this.digits);
  }

  get displayPremia(): string {
    return this.premia.toFixed(4);
  }
}
