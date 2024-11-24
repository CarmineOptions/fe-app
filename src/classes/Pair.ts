import { BigNumberish } from "starknet";

import { Token } from "./Token";
import { TokenKey } from "./Token";

export enum PairKey {
  ETH_USDC = "ETH / USDC",
  BTC_USDC = "wBTC / USDC",
  ETH_STRK = "ETH / STRK",
  STRK_USDC = "STRK / USDC",
  EKUBO_USDC = "EKUBO / USDC",
}

export class Pair {
  private _pairId: PairKey;
  private _base: Token;
  private _quote: Token;

  constructor(base: BigNumberish, quote: BigNumberish) {
    this._base = Token.byAddress(base);
    this._quote = Token.byAddress(quote);
    this._pairId = this.idByTokens(this.baseToken, this.quoteToken);
  }

  private idByTokens(base: Token, quote: Token): PairKey {
    if (base.id === TokenKey.ETH && quote.id === TokenKey.USDC) {
      return PairKey.ETH_USDC;
    }
    if (base.id === TokenKey.BTC && quote.id === TokenKey.USDC) {
      return PairKey.BTC_USDC;
    }
    if (base.id === TokenKey.ETH && quote.id === TokenKey.STRK) {
      return PairKey.ETH_STRK;
    }
    if (base.id === TokenKey.STRK && quote.id === TokenKey.USDC) {
      return PairKey.STRK_USDC;
    }
    if (base.id === TokenKey.EKUBO && quote.id === TokenKey.USDC) {
      return PairKey.EKUBO_USDC;
    }

    // unreachable
    throw new Error(`Pair with addresses "${base}" "${quote}" does not exist`);
  }

  public static pairByKey(key: PairKey): Pair {
    if (key === PairKey.ETH_USDC) {
      return new Pair(
        Token.byKey(TokenKey.ETH).address,
        Token.byKey(TokenKey.USDC).address
      );
    }
    if (key === PairKey.STRK_USDC) {
      return new Pair(
        Token.byKey(TokenKey.STRK).address,
        Token.byKey(TokenKey.USDC).address
      );
    }
    if (key === PairKey.BTC_USDC) {
      return new Pair(
        Token.byKey(TokenKey.BTC).address,
        Token.byKey(TokenKey.USDC).address
      );
    }
    if (key === PairKey.ETH_STRK) {
      return new Pair(
        Token.byKey(TokenKey.ETH).address,
        Token.byKey(TokenKey.STRK).address
      );
    }
    if (key === PairKey.EKUBO_USDC) {
      return new Pair(
        Token.byKey(TokenKey.EKUBO).address,
        Token.byKey(TokenKey.USDC).address
      );
    }
    // unreachable
    throw new Error(`Pair with key "${key}" does not exist`);
  }

  // GETTERS
  get pairId(): PairKey {
    return this._pairId;
  }

  get baseToken(): Token {
    return this._base;
  }

  get quoteToken(): Token {
    return this._quote;
  }
}
