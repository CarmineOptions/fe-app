import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
// import TradeTable from "../components/TradeTable";
// import { ComplexGraph } from "../components/CryptoGraph/TradingView";
import { Layout } from "../components/layout";
// import { Vote } from "../components/Vote/Vote";
import { Link } from "react-router-dom";

const TradePage = () => {
  useEffect(() => {
    document.title = "Buy | Carmine Finance";
  });

  return (
    <Layout>
      {/* 
      Uncomment this to show voting
      <Typography sx={{ mb: 2 }} variant="h4">
        Vote on proposal 14
      </Typography>
      <Vote /> */}
      <Typography sx={{ my: 2 }} variant="h4">
        Announcement
      </Typography>
      <Box sx={{ mb: 2, maxWidth: "800px" }}>
        <Typography>
          Carmine Options AMM is undergoing a major upgrade of its smart
          contracts and for this reason there are no issued options. We will
          resume the trading on Tuesday Jan 9th.
        </Typography>
        <br />
        <Typography>
          We have recently finished rewriting our codebase to the newest version
          of Cairo. This means we are completely getting rid of the Cairo 0
          implementation, which in turn means that the TVL cap will be removed!
          🎆 🚀 🌕
        </Typography>
        <br />
        <Typography>
          The proposal to redeploy our newest codebase is ready for voting and
          If it passes, you will be able to enjoy the new version on January
          9th.
        </Typography>
        <br />
        <Typography>
          🗳️ You can vote on the proposal
          <Link to="/governance">in the governance page</Link>. ✍️ And you can
          find the discussion{" "}
          <a href="https://discord.com/channels/969228248552706078/1192044317179658250">
            here on Discord
          </a>
          .
        </Typography>
        <br />
        <Typography>
          2️⃣ The proposal not only redeploys the AMM but adds on another
          underlying asset and allows for other assets to be added. It also
          removes the cap on the TVL. ♥️ These two things were second and third
          most requested updates to date. The first one was dark mode a year ago
          😄 🌑
        </Typography>
        <br />
        <Typography>
          Developers and the ambassadors agreed on proposing to add completely
          newly deployed AMM instead of upgrading the previous one. Originally
          we wanted to upgrade our existing codebase but this time around we
          felt that this involves a little too many uncertainties and that the
          safer option would be to redeploy.
        </Typography>
        <br />
        <Typography>
          ▶️ This means that the transition will not be as smooth since LPs will
          have to unstake from the old AMM pools and restake in the new version.
          However, we will provide a "single click button" 🖱️ to smoothen the
          transition.
        </Typography>
        <br />
        <Typography>
          👩‍❤️‍👨 New trading pairs! wBTC/USDC call and put options will now be a
          part of the Carmine Options AMM.
        </Typography>

        <Typography>
          Also, we have received requests to add STRK and LORDS tokens. The
          first one cannot be added until its distribution and the second one
          can come once the initial pairs and their liquidity pools will secure
          enough capital.
        </Typography>
        <br />

        <Typography>
          This is major proposal for us. Probably the most important till today
          and for the foreseeable future. So obviously we want to encourage
          everyone to vote.
        </Typography>
        <Typography>
          For this reason, everyone that votes in this proposal (as for all the
          proposals) will get additional Carmine tokens once the distribution
          comes. 🪙
        </Typography>
      </Box>
      {/* <Typography sx={{ mb: 2 }} variant="h4">
        Buy Options
      </Typography>
      <ComplexGraph /> */}
      {/* <TradeTable /> */}
    </Layout>
  );
};

export default TradePage;
