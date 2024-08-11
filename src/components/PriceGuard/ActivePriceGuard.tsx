import { LoadingAnimation } from "../Loading/Loading";
import { Box, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { OptionWithPosition } from "../../classes/Option";
import { openCloseOptionDialog, setCloseOption } from "../../redux/actions";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import styles from "../../style/button.module.css";

const PriceGuardDisplay = ({ option }: { option: OptionWithPosition }) => {
  const txPending = useTxPending(option.optionId, TransactionAction.TradeClose);
  const symbol = option.baseToken.symbol;
  const handleButtonClick = () => {
    setCloseOption(option);
    openCloseOptionDialog();
  };
  return (
    <Box sx={{ display: "flex", flexFlow: "column" }}>
      <Typography variant="h6">
        {symbol} ${option.strike}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexFlow: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography>
          Price Guard covers {option.size} {symbol} at price ${option.strike}{" "}
          and expires {option.dateRich}
        </Typography>
        <button
          className={styles.green}
          disabled={txPending}
          onClick={handleButtonClick}
        >
          {txPending ? "Processing..." : "Close"}
        </button>
      </Box>
    </Box>
  );
};

const WithAccount = ({ account }: { account: AccountInterface }) => {
  const { isLoading, isError, data } = useQuery(
    [QueryKeys.position, account.address],
    fetchPositions
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return (
      <Typography>
        We are experiencing difficulties fetching your data. Please try again
        later.
      </Typography>
    );
  }

  const priceGuard = data.filter((o) => o.isPut && o.isLong && o.isFresh);

  if (priceGuard.length === 0) {
    // no options for the given currency
    return (
      <Box sx={{ display: "flex", flexFlow: "column", gap: 2 }}>
        <Typography>
          You currently do not have any active Price Guard
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexFlow: "column",
        gap: 2,
      }}
    >
      <Typography>
        Your Carmine portfolio consists of {priceGuard.length} Long Put option
        {priceGuard.length > 1 ? "s" : ""} which insures these crypto assets
      </Typography>
      {priceGuard.map((o, i) => (
        <PriceGuardDisplay key={i} option={o} />
      ))}
    </Box>
  );
};

export const ActivePriceGuard = () => {
  const account = useAccount();

  if (!account) {
    return (
      <Typography>Connect wallet to see your active Price Guard</Typography>
    );
  }

  return <WithAccount account={account} />;
};
