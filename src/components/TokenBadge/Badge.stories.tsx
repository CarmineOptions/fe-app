import type { Meta, StoryObj } from "@storybook/react";

import {
  TokenBadge,
  TokenNamedBadge,
  PairBadge,
  PairNamedBadge,
} from "./Badge";
import { EthToken, StrkToken, UsdcToken } from "../../classes/Token";

const meta: Meta<typeof TokenBadge> = {
  component: TokenBadge,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof TokenBadge>;

export const StrkBadge: Story = {
  render: () => <TokenBadge token={StrkToken} />,
};

export const StrkNamedBadge: Story = {
  render: () => <TokenNamedBadge token={StrkToken} />,
};

export const EthUsdcBadge: Story = {
  render: () => <PairBadge tokenA={EthToken} tokenB={UsdcToken} />,
};

export const EthUsdcNamedBadge: Story = {
  render: () => <PairNamedBadge tokenA={EthToken} tokenB={UsdcToken} />,
};
