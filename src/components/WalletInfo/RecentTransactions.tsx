import { Link, Stack, Tooltip, useTheme } from "@mui/material";
import { useRecentTxs } from "../../hooks/useRecentTxs";
import {
  Transaction,
  TransactionStatus,
} from "../../redux/reducers/transactions";
import { debug } from "../../utils/debugger";
import { addressElision, getStarkscanUrl } from "../../utils/utils";
import { useCurrentChainId } from "../../hooks/useCurrentChainId";
import styles from "./walletinfo.module.css";

const Tx = ({ tx }: { tx: Transaction }) => {
  const theme = useTheme();

  const { hash, timestamp, action, status, chainId } = tx;
  const exploreUrl = getStarkscanUrl({
    chainId: chainId,
    txHash: hash,
  });

  const shade = theme.palette.mode;

  const color =
    status === TransactionStatus.Pending
      ? theme.palette.warning[shade]
      : status === TransactionStatus.Success
      ? theme.palette.success[shade]
      : theme.palette.error[shade];

  const d = new Date(timestamp);
  const dateOptions = {
    day: "numeric",
    month: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  } as const;
  const date = new Intl.DateTimeFormat("default", dateOptions).format(d);

  return (
    <div className={`${styles.grid} ${styles.container}`}>
      <div className={styles.div1}>
        <Tooltip title={hash}>
          <Link
            sx={{ color: theme.palette.text.primary }}
            target="_blank"
            href={exploreUrl}
            rel="noreferrer"
          >
            {addressElision(hash).toUpperCase()}
          </Link>
        </Tooltip>
      </div>
      <div className={styles.div2}>{action}</div>
      <div className={styles.div3}>
        <div style={{ background: color }} className={styles.bead}></div>
      </div>
      <div className={styles.div4}></div>
      <div className={styles.div5}>{date}</div>
      <div className={styles.div6}></div>
    </div>
  );
};

export const RecentTransaction = () => {
  const chainId = useCurrentChainId();
  const txs = useRecentTxs();

  const currentNetworkTxs = txs.filter((tx) => tx.chainId === chainId);

  debug("txs", { chainId, txs, currentNetworkTxs });

  if (txs.length === 0) {
    return <div className={styles.title}>No recent transactions</div>;
  }

  return (
    <div>
      <Stack
        sx={{
          maxHeight: "60vh",
          overflowY: "auto",
        }}
      >
        {txs.map((tx, i) => (
          <Tx tx={tx} key={i} />
        ))}
      </Stack>
    </div>
  );
};
