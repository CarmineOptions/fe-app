import { Helmet } from "react-helmet";

import { Layout } from "../components/Layout";
import { Proposals } from "../components/Proposal";
import { CarmineStaking } from "../components/CarmineStaking";
import { useGovernanceSubpage } from "../hooks/useGovernanceSubpage";
import { GovernanceSubpage } from "../redux/reducers/ui";
import { useNavigate } from "react-router-dom";
import buttonStyles from "../style/button.module.css";
import { setGovernanceSubpage } from "../redux/actions";
import { Airdrop } from "../components/Airdrop/Airdrop";
import { useEffect } from "react";

const VotingSubpage = () => {
  return (
    <div>
      <h2>Proposals</h2>
      <p>Vote on AMM defining proposals.</p>
      <p>
        To find out more about the proposals and discuss, go to{" "}
        <a
          href="https://discord.com/channels/969228248552706078/1124013480123584622"
          target="_blank"
          rel="noreferrer"
        >
          Proposals channel on Carmine Options AMM Discord
        </a>
        .
      </p>
      <Proposals />
    </div>
  );
};

const StakingSubpage = () => {
  return (
    <div>
      <h2>CRM Staking</h2>
      <CarmineStaking />
    </div>
  );
};

const AirdropSubpage = () => {
  return (
    <div>
      <h2>Airdrop</h2>
      <Airdrop />
    </div>
  );
};

const Governance = () => {
  const subpage = useGovernanceSubpage();
  const navigate = useNavigate();

  useEffect(() => {
    const parts = window.location.pathname.split("/").filter((s) => s !== "");

    if (
      parts.length === 2 &&
      Object.values(GovernanceSubpage).includes(
        parts[1] as GovernanceSubpage
      ) &&
      (parts[1] as GovernanceSubpage) !== subpage
    ) {
      setGovernanceSubpage(parts[1] as GovernanceSubpage);
    }
  });

  const handleNavigateClick = (subpage: GovernanceSubpage) => {
    setGovernanceSubpage(subpage);
    navigate(`/governance/${subpage}`);
  };

  return (
    <Layout>
      <Helmet>
        <title>Governance | Carmine Options AMM</title>
        <meta
          name="description"
          content="Vote on proposals and take part in governing Carmine Options AMM"
        />
      </Helmet>
      <h1>Governance</h1>
      <button
        className={`${
          subpage === GovernanceSubpage.AirDrop && buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          handleNavigateClick(GovernanceSubpage.AirDrop);
        }}
      >
        Airdrop
      </button>
      <button
        className={`${
          subpage === GovernanceSubpage.Voting && buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          handleNavigateClick(GovernanceSubpage.Voting);
        }}
      >
        Voting
      </button>
      <button
        className={`${
          subpage === GovernanceSubpage.Staking && buttonStyles.secondary
        } ${buttonStyles.offset}`}
        onClick={() => {
          handleNavigateClick(GovernanceSubpage.Staking);
        }}
      >
        Staking
      </button>

      {subpage === GovernanceSubpage.Voting && <VotingSubpage />}
      {subpage === GovernanceSubpage.Staking && <StakingSubpage />}
      {subpage === GovernanceSubpage.AirDrop && <AirdropSubpage />}
    </Layout>
  );
};

export default Governance;
