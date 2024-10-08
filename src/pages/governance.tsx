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

import styles from "./governance.module.css";
import { AddProposal } from "../components/AddProposal";
import { useAccount } from "../hooks/useAccount";
import { coreTeamAddresses } from "../constants/amm";

const VotingSubpage = () => {
  return (
    <div>
      <h2>Proposals</h2>
      <div className="divider botmargin topmargin" />
      <p>Vote on AMM defining proposals.</p>
      <p className="botmargin">
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
      <div className="divider botmargin topmargin" />
      <CarmineStaking />
    </div>
  );
};

const AirdropSubpage = () => {
  return (
    <div>
      <h2>Airdrop</h2>
      <div className="divider botmargin topmargin" />
      <Airdrop />
    </div>
  );
};

const ProposeOptionsSubpage = () => {
  return (
    <div>
      <h2>Propose</h2>
      <div className="divider botmargin topmargin" />
      <AddProposal />
    </div>
  );
};

const Governance = () => {
  const account = useAccount();
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
      <h1 className="botmargin">Governance</h1>
      <div className={styles.buttoncontainer + " botmargin"}>
        <div>
          <button
            className={`${
              subpage === GovernanceSubpage.AirDrop && "primary active"
            } ${buttonStyles.offset}`}
            onClick={() => {
              handleNavigateClick(GovernanceSubpage.AirDrop);
            }}
          >
            Airdrop
          </button>
          <button
            className={`${
              subpage === GovernanceSubpage.Voting && "primary active"
            } ${buttonStyles.offset}`}
            onClick={() => {
              handleNavigateClick(GovernanceSubpage.Voting);
            }}
          >
            Voting
          </button>
          <button
            className={`${
              subpage === GovernanceSubpage.Staking && "primary active"
            } ${buttonStyles.offset}`}
            onClick={() => {
              handleNavigateClick(GovernanceSubpage.Staking);
            }}
          >
            Staking
          </button>
          {/* CURRENTLY ONLY SHOW TO THE CORE TEAM MEMBERS */}
          {account?.address && coreTeamAddresses.includes(account.address) && (
            <button
              className={`${
                subpage === GovernanceSubpage.Propose && "primary active"
              } ${buttonStyles.offset}`}
              onClick={() => {
                handleNavigateClick(GovernanceSubpage.Propose);
              }}
            >
              Propose
            </button>
          )}
        </div>
        <div className="divider" />
      </div>
      {subpage === GovernanceSubpage.Voting && <VotingSubpage />}
      {subpage === GovernanceSubpage.Staking && <StakingSubpage />}
      {subpage === GovernanceSubpage.AirDrop && <AirdropSubpage />}
      {subpage === GovernanceSubpage.Propose && <ProposeOptionsSubpage />}
    </Layout>
  );
};

export default Governance;
