import type { Meta, StoryObj } from "@storybook/react";

import {
  TokenBadge,
  TokenNamedBadge,
  PairBadge,
  PairNamedBadge,
} from "./Badge";
import { tokenBySymbol } from "@carmine-options/sdk/core";

const meta: Meta<typeof TokenBadge> = {
  component: TokenBadge,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof TokenBadge>;

const strkToken = tokenBySymbol("STRK").unwrap();
const ethToken = tokenBySymbol("ETH").unwrap();
const usdcToken = tokenBySymbol("USDC").unwrap();

export const StrkBadge: Story = {
  render: () => <TokenBadge token={strkToken} />,
};

export const StrkNamedBadge: Story = {
  render: () => <TokenNamedBadge token={strkToken} />,
};

export const EthUsdcBadge: Story = {
  render: () => <PairBadge tokenA={ethToken} tokenB={usdcToken} />,
};

export const EthUsdcNamedBadge: Story = {
  render: () => <PairNamedBadge tokenA={ethToken} tokenB={usdcToken} />,
};
