import { LoadingAnimation } from "../Loading/Loading";
import { Box, Typography } from "@mui/material";
import { useQuery } from "react-query";
import { QueryKeys } from "../../queries/keys";
import { useAccount } from "../../hooks/useAccount";
import { AccountInterface } from "starknet";
import { fetchPositions } from "../PositionTable/fetchPositions";
import { OptionWithPosition } from "../../classes/Option";
import { tradeSettle } from "../../calls/tradeSettle";
import { useTxPending } from "../../hooks/useRecentTxs";
import { TransactionAction } from "../../redux/reducers/transactions";
import styles from "../../style/button.module.css";
import { debug } from "../../utils/debugger";

const ClaimItem = ({
  option,
  account,
}: {
  option: OptionWithPosition;
  account: AccountInterface;
}) => {
  const txPending = useTxPending(option.optionId, TransactionAction.Settle);
  const symbol = option.baseToken.symbol;

  const handleButtonClick = () => tradeSettle(account, option);

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
          You are eligible to claim ${option.value.toFixed(4)}
        </Typography>
        <button
          className={styles.green}
          onClick={handleButtonClick}
          disabled={txPending}
        >
          {txPending ? "Processing..." : "Claim"}
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

  debug("INSURANCE OPTIONS", data);

  const insurance = data.filter((o) => o.isPut && o.isLong && o.isInTheMoney);

  if (insurance.length === 0) {
    // no options for the given currency
    return (
      <Box sx={{ display: "flex", flexFlow: "column", gap: 2 }}>
        <Typography>
          You currently do not have any claimable insurance
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
        You have {insurance.length} claimable insurance event
        {insurance.length > 1 ? "s" : ""}:
      </Typography>
      {insurance.map((o, i) => (
        <ClaimItem key={i} option={o} account={account} />
      ))}
    </Box>
  );
};

export const ClaimInsurance = () => {
  const account = useAccount();

  if (!account) {
    return <Typography>Connect wallet to see claimable insurance</Typography>;
  }

  return <WithAccount account={account} />;
};
