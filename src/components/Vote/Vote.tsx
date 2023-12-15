import { Box, Button, Link, Typography } from "@mui/material";
import { AccountInterface } from "starknet";
import { debug } from "../../utils/debugger";
import { useAccount } from "../../hooks/useAccount";
import GovernanceAbi from "../../abi/amm_abi.json";
import { getTokenAddresses } from "../../constants/amm";
import { Proposal } from "../../types/proposal";

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
    contractAddress: getTokenAddresses().GOVERNANCE_CONTRACT_ADDRESS,
    entrypoint: "vote",
    calldata: [propId, opinion],
  };

  const res = await account.execute(call, [GovernanceAbi]).catch((e) => {
    debug("Vote rejected or failed", e.message);
  });
  debug(res);
};

export const Vote = ({ discordLink, id }: Proposal) => {
  const account = useAccount();

  const voteButtonSx = { m: 2 };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexFlow: "column",
        my: 8,
        mx: 2,
      }}
    >
      {!!discordLink && (
        <>
          <Typography>
            To see proposal details and discuss go to the{" "}
            <Link
              target="_blank"
              href="https://discord.com/channels/969228248552706078/1035256265082949722/1116669484124622889"
            >
              Discord thread
            </Link>
            .
          </Typography>
        </>
      )}
      {!account && <Typography>Connect your wallet to vote</Typography>}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexFlow: "row",
          gap: 2,
        }}
      >
        <Button
          onClick={() => vote(account!, id, Opinion.YAY)}
          sx={voteButtonSx}
          variant="contained"
          disabled={!account}
        >
          Vote Yes
        </Button>
        <Button
          onClick={() => vote(account!, id, Opinion.NAY)}
          sx={voteButtonSx}
          variant="contained"
          disabled={!account}
        >
          Vote No
        </Button>
      </Box>
    </Box>
  );
};
