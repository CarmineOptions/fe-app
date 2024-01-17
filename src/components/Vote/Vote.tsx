import { AccountInterface } from "starknet";

import GovernanceAbi from "../../abi/amm_abi.json";
import { GOVERNANCE_ADDRESS } from "../../constants/amm";
import { Proposal } from "../../types/proposal";
import { debug } from "../../utils/debugger";
import styles from "./Vote.module.css";

enum Opinion {
  YAY = "1",
  NAY = "2",
}

const vote = async (
  account: AccountInterface,
  propId: number,
  opinion: Opinion
) => {
  const call = {
    contractAddress: GOVERNANCE_ADDRESS,
    entrypoint: "vote",
    calldata: [propId, opinion],
  };

  const res = await account.execute(call, [GovernanceAbi]).catch((e) => {
    debug("Vote rejected or failed", e.message);
  });
  debug(res);
};

type VoteButtonsProps = {
  account?: AccountInterface;
  propId: number;
  balance: bigint;
};

const VoteButtons = ({ account, propId, balance }: VoteButtonsProps) => {
  if (!account) {
    return <p>Connect wallet to vote</p>;
  }
  if (balance === 0n) {
    return <p>Only Carmine Token holders can vote</p>;
  }
  return (
    <div className={styles.votebuttoncontainer}>
      <button onClick={() => vote(account, propId, Opinion.YAY)}>
        Vote Yes
      </button>
      <button onClick={() => vote(account, propId, Opinion.NAY)}>
        Vote No
      </button>
    </div>
  );
};

type PropMessageProps = {
  link?: string;
};

const PropMessage = ({ link }: PropMessageProps) => {
  if (link) {
    return (
      <p>
        To see proposal details and discuss go to the{" "}
        <a target="_blank" rel="noopener nofollow noreferrer" href={link}>
          Discord thread
        </a>
        .
      </p>
    );
  }
  return (
    <p>
      There is currently no thread associated with this proposal, feel free to{" "}
      <a
        target="_blank"
        rel="noopener nofollow noreferrer"
        href="https://discord.com/channels/969228248552706078/969228248552706081" // community/general channel
      >
        discuss on our Discord
      </a>
      .
    </p>
  );
};

type VoteProps = {
  proposal: Proposal;
  balance: bigint;
  account?: AccountInterface;
};

export const Vote = ({ proposal, balance, account }: VoteProps) => {
  return (
    <div>
      <PropMessage link={proposal.discordLink} />
      <VoteButtons account={account} propId={proposal.id} balance={balance} />
    </div>
  );
};
