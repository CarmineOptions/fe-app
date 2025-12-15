import { Meta, StoryObj } from "@storybook/react";
import { ReactNode } from "react";
import { ClosePosition } from "./ClosePosition";
import { ETH_ADDRESS, USDC_ADDRESS } from "../../constants/amm";
import {
  OptionSideLong,
  OptionTypePut,
  OptionWithUserPosition,
} from "@carmine-options/sdk/core";

const MockSidebar = ({ children }: { children: ReactNode }) => (
  <div className="w-sidebar border-dark-primary border-2 h-dvh py-10 px-5">
    <h1 className="mb-5">SIDEBAR</h1>
    {children}
  </div>
);

const longPut = new OptionWithUserPosition(
  {
    base_token_address: ETH_ADDRESS,
    quote_token_address: USDC_ADDRESS,
    option_type: OptionTypePut,
    option_side: OptionSideLong,
    maturity: 1764577072,
    strike_price: { mag: 40582836962161013555200n, sign: false },
  },
  { mag: 1000000000000000000n, sign: false },
  { low: 4655373697392086016n, high: 0n }
);

export const LongPut: StoryObj = {
  render: () => (
    <MockSidebar>
      <ClosePosition option={longPut} />
    </MockSidebar>
  ),
};

export default {
  component: ClosePosition,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} as Meta<typeof ClosePosition>;
