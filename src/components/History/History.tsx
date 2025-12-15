import { TradeEvents } from "./TradeEvents";
import { LiquidityEvents } from "./LiquidityEvents";
import { VoteEvents } from "./VoteEvents";

export const History = () => {
  return (
    <div className="mb-20">
      <h1 style={{ marginTop: "40px" }}>Trade History</h1>
      <TradeEvents />
      <h1 style={{ marginTop: "40px" }}>Liquidity History</h1>
      <LiquidityEvents />
      <h1 style={{ marginTop: "40px" }}>Vote History</h1>
      <VoteEvents />
    </div>
  );
};
