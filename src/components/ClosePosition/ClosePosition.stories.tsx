import { Meta, StoryObj } from "@storybook/react";
import { ReactNode } from "react";

import { ClosePosition } from "./ClosePosition";
import { OptionWithPosition } from "../../classes/Option";
import { ETH_ADDRESS, USDC_ADDRESS } from "../../constants/amm";
import { OptionSide, OptionType } from "../../types/options";

const MockSidebar = ({ children }: { children: ReactNode }) => (
  <div className="w-sidebar border-dark-primary border-2 h-dvh py-10 px-5">
    <h1 className="mb-5">SIDEBAR</h1>
    {children}
  </div>
);

const longPut = new OptionWithPosition(
  ETH_ADDRESS,
  USDC_ADDRESS,
  OptionType.Put,
  OptionSide.Long,
  1764577072,
  "0x8980000000000000000",
  "0xde0b6b3a7640000",
  "0x409b35b669c08a12"
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
