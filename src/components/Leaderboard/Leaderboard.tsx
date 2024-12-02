import { addressElision, standardiseAddress } from "../../utils/utils";
import { BlackWallet, WhiteWallet } from "../Icons";
import { BraavosBonus } from "../Points/fetch";
import { BraavosBadge } from "../Points";
import { useAccount } from "@starknet-react/core";

import styles from "./leaderboard.module.css";

export type ItemProps = {
  position: number;
  address: string;
  username?: string;
  data: (string | JSX.Element)[];
  className?: string;
  braavos?: BraavosBonus;
  isCurrentUser?: boolean;
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
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1">
      {position < 3 ? <BlackWallet /> : <WhiteWallet />}
      <a
        target="_blank"
        rel="noopener nofollow noreferrer"
        href={`https://starkscan.co/contract/${address}`}
        className={`no-underline ${
          position < 3 ? "text-dark" : "text-dark-primary"
        }`}
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
  isCurrentUser = false,
}: ItemProps) => {
  console.log(address, isCurrentUser);
  return (
    <tr className={`relative ${className}`}>
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
      {isCurrentUser && (
        <div className="bg-brand text-dark px-1 rounded-sm absolute top-[-10px] left-[9px]">
          YOU
        </div>
      )}
    </tr>
  );
};

export const Leaderboard = ({ header, items, user, braavos }: Props) => {
  const { address: currentUserAddress } = useAccount();

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
    <div className="min-w-big overflow-x-auto">
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
              isCurrentUser={true}
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
              isCurrentUser={
                currentUserAddress &&
                standardiseAddress(address) ===
                  standardiseAddress(currentUserAddress)
              }
              key={i}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
