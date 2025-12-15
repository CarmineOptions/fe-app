import type { Meta, StoryObj } from "@storybook/react";

import { OptionSidebarSuccessView } from "./OptionSidebarSuccess";
import { STRK_ADDRESS, USDC_ADDRESS } from "../../constants/amm";
import { SidebarView } from "./Sidebar";
import { SidebarWidth } from "../../redux/reducers/ui";
import { PoolSidebarSuccessView } from "./PoolSidebarSuccess";
import {
  LiquidityPool,
  OptionSideLong,
  OptionTypeCall,
  OptionWithPremia,
} from "@carmine-options/sdk/core";

const meta: Meta<typeof OptionSidebarSuccessView> = {
  component: OptionSidebarSuccessView,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
};

export default meta;

const opt = new OptionWithPremia(
  {
    base_token_address: STRK_ADDRESS,
    quote_token_address: USDC_ADDRESS,
    option_type: OptionTypeCall,
    option_side: OptionSideLong,
    maturity: 1764749405,
    strike_price: { mag: 8301034833169298432n, sign: false },
  },
  { mag: 12345n, sign: false }
);

export const OptionSuccessSidebar: StoryObj = {
  render: () => (
    <div>
      <SidebarView
        sidebarOpen={true}
        sidebarContent={
          <OptionSidebarSuccessView
            handlePortfolioClick={() => {}}
            option={opt}
            size={1.2}
            amount={0.2}
            amountUsd={0.14}
            tx={"0x1234567890"}
          />
        }
        sidebarWidth={SidebarWidth.Base}
      />
    </div>
  ),
};

export const PoolSuccessSidebar: StoryObj = {
  render: () => (
    <div>
      <SidebarView
        sidebarOpen={true}
        sidebarContent={
          <PoolSidebarSuccessView
            handlePortfolioClick={() => {}}
            pool={new LiquidityPool(STRK_ADDRESS, USDC_ADDRESS, OptionTypeCall)}
            deposited={120}
            depositedUsd={84}
            currentPosition={1250000}
            currentPositionUsd={875000}
            tx={"0x1234567890"}
          />
        }
        sidebarWidth={SidebarWidth.Base}
      />
    </div>
  ),
};
