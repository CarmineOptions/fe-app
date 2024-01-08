import { Box, Button, Link, Typography } from "@mui/material";
import BN from "bn.js";
import { useEffect, useState } from "react";
import { AccountInterface } from "starknet";

import GovernanceAbi from "../../abi/amm_abi.json";
import { balanceOfCarmineToken } from "../../calls/balanceOf";
import { getTokenAddresses } from "../../constants/amm";
import { useAccount } from "../../hooks/useAccount";
import { Proposal } from "../../types/proposal";
import { debug } from "../../utils/debugger";

var ZERO = new BN('0', 10);

enum Opinion {
  YAY = "1",
  NAY = "2",
}

const vote = async (
  account: AccountInterface,
  propId: number,
  opinion: Opinion
) => {
  const bal = await balanceOfCarmineToken(account!);
  if(bal.gtn(0)){
    const call = {
      contractAddress: getTokenAddresses().GOVERNANCE_CONTRACT_ADDRESS,
      entrypoint: "vote",
      calldata: [propId, opinion],
    };
  
    const res = await account.execute(call, [GovernanceAbi]).catch((e) => {
      debug("Vote rejected or failed", e.message);
    });
    debug(res);  
  } else {
    debug("Insufficent Balance");
  }
};

export const Vote = ({ discordLink, id }: Proposal) => {
  const account = useAccount();
  const [balCarmine, setBalance] = useState(ZERO);
  const voteButtonSx = { m: 2 };
  useEffect(() => {
    async function getBalance() {
      const bal = await balanceOfCarmineToken(account!);
      setBalance(bal);
    }
    getBalance()
  }, [account]);
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
            <Link target="_blank" href={discordLink}>
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
          disabled={!account || balCarmine.gtn(0)}
        >
          Vote Yes
        </Button>
        <Button
          onClick={() => vote(account!, id, Opinion.NAY)}
          sx={voteButtonSx}
          variant="contained"
          disabled={!account || balCarmine.gtn(0)}
        >
          Vote No
        </Button>
      </Box>
    </Box>
  );
};
