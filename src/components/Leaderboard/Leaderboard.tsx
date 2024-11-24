import { addressElision } from "../../utils/utils";
import { BlackWallet, WhiteWallet } from "../Icons";

import styles from "./leaderboard.module.css";
import { BraavosBonus } from "../Points/fetch";
import { BraavosBadge } from "../Points";

export type ItemProps = {
  position: number;
  address: string;
  username?: string;
  data: (string | JSX.Element)[];
  className?: string;
  braavos?: BraavosBonus;
};

type Props = {
  header: string[];
  items: ItemProps[];
  user?: ItemProps;
  braavos?: {
    [key: string]: BraavosBonus;
  };
};

export const ClickableUser = ({
  address,
  username,
  position,
  braavos,
}: {
  address: string;
  username: string | undefined;
  position: number;
  braavos?: BraavosBonus;
}) => (
  <div className={styles.badgecontainer}>
    <div className={styles.wallet}>
      {position < 3 ? <BlackWallet /> : <WhiteWallet />}
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
    {braavos && <BraavosBadge data={braavos} />}
  </div>
);

const LeaderboardItem = ({
  position,
  address,
  username,
  data,
  className,
  braavos,
}: ItemProps) => {
  return (
    <tr className={className ?? ""}>
      <td>{position}</td>
      <td>
        <ClickableUser
          address={address}
          username={username}
          position={position}
          braavos={braavos}
        />
      </td>
      {data.map((v, i) => (
        <td key={i}>{v}</td>
      ))}
      {className === styles.user && <div className={styles.badge}>YOU</div>}
    </tr>
  );
};

export const Leaderboard = ({ header, items, user, braavos }: Props) => {
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
            braavos={braavos && braavos[user.address]}
          />
        )}
        {items.map(({ position, address, username, data }, i) => (
          <LeaderboardItem
            className={positionToClassName(position)}
            position={position}
            address={address}
            username={username}
            data={data}
            braavos={braavos && braavos[address]}
            key={i}
          />
        ))}
      </tbody>
    </table>
  );
};
