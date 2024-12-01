import { Meta, StoryObj } from "@storybook/react";
import { Txs } from "./RecentTransactions";
import { ReactNode } from "react";
import {
  TransactionAction,
  TransactionStatus,
} from "../../redux/reducers/transactions";
import { constants } from "starknet";

const MockSidebar = ({ children }: { children: ReactNode }) => (
  <div className="w-sidebar border-dark-primary border-2 h-dvh py-10 px-5">
    <h1 className="mb-5">SIDEBAR</h1>
    {children}
  </div>
);

export const NoTransactions: StoryObj = {
  render: () => (
    <MockSidebar>
      <Txs txs={[]} />
    </MockSidebar>
  ),
};

export const Transactions: StoryObj = {
  render: () => (
    <MockSidebar>
      <Txs
        txs={[
          {
            action: TransactionAction.TradeOpen,
            hash: "0x4e481A9dA47AF161Fa674A6CA25d00e2c053662de06a17dB129D72FC7370acA",
            id: "1",
            timestamp: 1733044672,
            status: TransactionStatus.Pending,
            chainId: constants.StarknetChainId.SN_MAIN,
          },
          {
            action: TransactionAction.TradeOpen,
            hash: "0x4e481A9dA47AF161Fa674A6CA25d00e2c053662de06a17dB129D72FC7370acA",
            id: "2",
            timestamp: 1733004672,
            finishedTimestamp: 1733044672,
            status: TransactionStatus.Success,
            chainId: constants.StarknetChainId.SN_MAIN,
          },
          {
            action: TransactionAction.TradeOpen,
            hash: "0x4e481A9dA47AF161Fa674A6CA25d00e2c053662de06a17dB129D72FC7370acA",
            id: "3",
            timestamp: 1732504672,
            finishedTimestamp: 1733044672,
            status: TransactionStatus.Failed,
            chainId: constants.StarknetChainId.SN_MAIN,
          },
        ]}
      />
    </MockSidebar>
  ),
};

export default {
  component: Txs,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} as Meta<typeof Txs>;
