import { CARMINE_STAKING_MONTH, CARMINE_STAKING_YEAR } from "../constants/amm";
import { CarmineStakeResultWithId } from "../types/governance";
import { shortInteger } from "../utils/computations";

const formatDate = (ts: number) =>
  new Intl.DateTimeFormat("default", {
    hour: "numeric",
    minute: "numeric",
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZoneName: "short",
  }).format(ts * 1000);

export class CarmineStake {
  public amountStaked;
  public amountVotingToken;
  public start;
  public length;
  public withdrawn;
  public end;
  public id;

  constructor({
    amount_staked,
    amount_voting_token,
    start_date,
    length,
    withdrawn,
    id,
  }: CarmineStakeResultWithId) {
    const numStart = Number(start_date);
    const numLength = Number(length);
    this.amountStaked = amount_staked;
    this.amountVotingToken = amount_voting_token;
    this.start = numStart;
    this.length = numLength;
    this.withdrawn = withdrawn;
    this.end = numStart + numLength;
    this.id = id;
  }

  get isActive(): boolean {
    const now = Date.now() / 1000;
    return !this.withdrawn && this.end > now;
  }

  get isExpired(): boolean {
    const now = Date.now() / 1000;
    return !this.withdrawn && this.end <= now;
  }

  get isNotWithdrawn(): boolean {
    return !this.withdrawn;
  }

  get startDate(): string {
    return formatDate(this.start);
  }

  get endDate(): string {
    return formatDate(this.end);
  }

  get period(): string {
    const months = this.length / CARMINE_STAKING_MONTH;

    if (this.length === CARMINE_STAKING_MONTH) {
      return "1 month";
    }
    if (this.length === CARMINE_STAKING_YEAR) {
      return "1 year";
    }
    if (months > 12) {
      return months / 12 + "years";
    }
    return months + " months";
  }

  get amountStakedHumanReadable(): number {
    return shortInteger(this.amountStaked, 18);
  }

  get amountVotingTokenHumanReadable(): number {
    return shortInteger(this.amountVotingToken, 18);
  }
}
