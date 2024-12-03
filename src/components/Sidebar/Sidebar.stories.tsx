import type { Meta, StoryObj } from "@storybook/react";

import { OptionSidebarSuccessView } from "./OptionSidebarSuccess";
import { OptionWithPremia } from "../../classes/Option";
import { STRK_ADDRESS, USDC_ADDRESS } from "../../constants/amm";
import { OptionSide, OptionType } from "../../types/options";
import { SidebarView } from "./Sidebar";
import { SidebarWidth } from "../../redux/reducers/ui";
import { PoolSidebarSuccessView } from "./PoolSidebarSuccess";
import { Pool } from "../../classes/Pool";

const meta: Meta<typeof OptionSidebarSuccessView> = {
  component: OptionSidebarSuccessView,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
};

export default meta;

const opt = new OptionWithPremia(
  STRK_ADDRESS,
  USDC_ADDRESS,
  OptionType.Call,
  OptionSide.Long,
  1764749405,
  "0x7333333333333400",
  12345
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
            pool={new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Call)}
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
