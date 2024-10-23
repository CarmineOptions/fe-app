import { addressElision } from "../../utils/utils";
import { ReactComponent as BlackWalletIcon } from "./wallet.svg";
import { ReactComponent as WalletIcon } from "./whiteWallet.svg";

import styles from "./leaderboard.module.css";

export type ItemProps = {
  position: number;
  address: string;
  username?: string;
  data: (string | JSX.Element)[];
  className?: string;
};

type Props = {
  header: string[];
  items: ItemProps[];
  user?: ItemProps;
};

export const ClickableUser = ({
  address,
  username,
  position,
}: {
  address: string;
  username: string | undefined;
  position: number;
}) => (
  <div className={styles.wallet}>
    {position < 3 ? <BlackWalletIcon /> : <WalletIcon />}
    <a
      target="_blank"
      rel="noopener nofollow noreferrer"
      href={`https://starkscan.co/contract/${address}`}
      style={{
        color: position < 3 ? "black" : "white",
        textDecoration: "none",
      }}
    >
      {username ? username : addressElision(address)}
    </a>
  </div>
);

const LeaderboardItem = ({
  position,
  address,
  username,
  data,
  className,
}: ItemProps) => {
  return (
    <tr className={className ?? ""}>
      <td>{position}</td>
      <td>
        <ClickableUser
          address={address}
          username={username}
          position={position}
        />
      </td>
      {data.map((v) => (
        <td>{v}</td>
      ))}
      {className === styles.user && <div className={styles.badge}>YOU</div>}
    </tr>
  );
};

export const Leaderboard = ({ header, items, user }: Props) => {
  const positionToClassName = (position: number) => {
    if (position > 3 || position < 1) {
      return;
    }
    if (position === 1) {
      return styles.first;
    }
    if (position === 2) {
      return styles.second;
    }
    if (position === 3) {
      return styles.third;
    }
    // unreachable
    return;
  };

  return (
    <table className={styles.leaderboard}>
      <thead>
        <tr>
          {header.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {user && (
          <LeaderboardItem
            className={styles.user}
            position={user.position}
            address={user.address}
            username={user.username}
            data={user.data}
          />
        )}
        {items.map(({ position, address, username, data }, i) => (
          <LeaderboardItem
            className={positionToClassName(position)}
            position={position}
            address={address}
            username={username}
            data={data}
            key={i}
          />
        ))}
      </tbody>
    </table>
  );
};
