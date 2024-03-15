import { BigNumberish } from "starknet";

import { Token } from "./Token";
import { TokenKey } from "./Token";

export enum PairKey {
  ETH_USDC = "ETH / USDC",
  BTC_USDC = "wBTC / USDC",
  ETH_STRK = "ETH / STRK",
  STRK_USDC = "STRK / USDC",
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

    // unreachable
    throw new Error(`Pair with addresses "${base}" "${quote}" does not exist`);
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
