import { Tooltip } from "@mui/material";
import { memo } from "react";

import { useRecentTxs } from "../../hooks/useRecentTxs";
import {
  Transaction,
  TransactionStatus,
} from "../../redux/reducers/transactions";
import { debug } from "../../utils/debugger";
import { addressElision, getStarkscanUrl } from "../../utils/utils";
import { useCurrentChainId } from "../../hooks/useCurrentChainId";
import { MaturityStacked, P3 } from "../common";

const Tx = ({ tx }: { tx: Transaction }) => {
  const { hash, timestamp, action, status, chainId } = tx;
  const exploreUrl = getStarkscanUrl({
    chainId: chainId,
    txHash: hash,
  });

  const iconClass = `p-2 h-4 w-4 rounded-full inline-block ${
    status === TransactionStatus.Pending
      ? "bg-brand-deep"
      : status === TransactionStatus.Success
      ? "bg-ui-successBg"
      : "bg-ui-errorBg"
  }`;

  return (
    <div className="flex gap-3 justify-between items-center">
      <div className="w-full">
        <Tooltip title="Show transaction on Starkscan">
          <a href={exploreUrl} target="_blank" rel="noreferrer">
            <P3 className="tracking-tighter">{addressElision(hash)}</P3>
          </a>
        </Tooltip>
      </div>
      <div className="w-full">
        <P3 className="font-bold">{action}</P3>
      </div>
      <div className="w-full">
        <MaturityStacked timestamp={timestamp} />
      </div>
      <div className={iconClass}></div>
    </div>
  );
};

type TxsProps = {
  txs: Transaction[];
};

export const Txs = memo(({ txs }: TxsProps) => {
  if (txs.length === 0) {
    return <P3>No recent transactions</P3>;
  }

  return (
    <div className="flex flex-col gap-4">
      {txs.map((tx, i) => (
        <Tx tx={tx} key={i} />
      ))}
    </div>
  );
});

export const RecentTransaction = () => {
  const chainId = useCurrentChainId();
  const txs = useRecentTxs();

  const currentNetworkTxs = txs.filter((tx) => tx.chainId === chainId);

  debug("txs", { chainId, txs, currentNetworkTxs });

  if (txs.length === 0) {
    return <P3>No recent transactions</P3>;
  }

  return <Txs txs={txs} />;
};
