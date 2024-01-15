import { useQuery } from "react-query";
import { getLegacyPositionsOfUser } from "./optionsToSettle";
import { OptionWithPosition } from "../../classes/Option";
import { legacyTradeSettle } from "./legacySettle";
import { useAccount } from "../../hooks/useAccount";

import styles from "../../style/button.module.css";

type ItemProps = {
  option: OptionWithPosition;
};

const Item = ({ option }: ItemProps) => {
  const correctStrike = (
    (BigInt(option.strike) * 2n ** 64n) /
    2n ** 61n
  ).toString(10);
  return (
    <li>
      {option.name} {correctStrike}, maturity: {option.dateShort} size:{" "}
      {option.size}, value: {option.value}
    </li>
  );
};

export const PositionsToSettle = () => {
  const account = useAccount();
  const { isLoading, isError, isFetching, data } = useQuery(
    ["LegacyPosition", account?.address],
    getLegacyPositionsOfUser
  );

  if (!account) {
    return <div>Connect wallet to check legacy positions</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isFetching) {
    return <div>Fetching...</div>;
  }

  if (isError) {
    return <div>Failed</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  if (data.length === 0) {
    return <div>No positions to settle</div>;
  }

  const handleClick = () => legacyTradeSettle(account, data);

  return (
    <div style={{ marginBottom: "500px" }}>
      <ul>
        {data.map((optionWithPosition, index) => (
          <Item option={optionWithPosition} key={index} />
        ))}
      </ul>
      <button className={styles.button} onClick={handleClick}>
        Settle All
      </button>
    </div>
  );
};
