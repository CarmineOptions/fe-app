import { Helmet } from "react-helmet";
import { useAccount } from "@starknet-react/core";
import { useEffect } from "react";

import { Layout } from "../components/Layout";
import { CarmineStaking } from "../components/CarmineStaking";
import { useGovernanceSubpage } from "../hooks/useGovernanceSubpage";
import { GovernanceSubpage } from "../redux/reducers/ui";
import { useNavigate } from "react-router-dom";
import { setGovernanceSubpage } from "../redux/actions";
import { AddProposal } from "../components/AddProposal";
import { coreTeamAddresses } from "../constants/amm";
import { standardiseAddress } from "../utils/utils";
import { Divider, H4, H5, H6 } from "../components/common";
import { Voting } from "../components/Governance";

const VotingSubpage = () => {
  return <Voting />;
};

const StakingSubpage = () => {
  return <CarmineStaking />;
};

const ProposeOptionsSubpage = () => {
  return (
    <div>
      <H5>Propose New Options</H5>
      <Divider className="my-8" />
      <AddProposal />
    </div>
  );
};

const GovernancePage = () => {
  const { address } = useAccount();
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
      <div className="flex flex-col gap-5">
        <H4>Governance</H4>
        <a
          href="https://discord.com/channels/969228248552706078/1124013480123584622" // carmine proposals URL
          target="_blank"
          rel="noopener nofollow noreferrer"
          className="px-6 py-3 rounded-md bg-gradient-to-r from-[#FFB60A] to-[#EEB735]"
        >
          <H6 className="text-dark">
            Discuss upcoming proposals on the Carmine Discord →
          </H6>
        </a>

        <div className="flex flex-col md:flex-row gap-7 mb-8">
          {[
            GovernanceSubpage.Voting,
            GovernanceSubpage.Staking,
            GovernanceSubpage.Propose,
          ].map((subpageCurrent, i) => {
            if (
              subpageCurrent === GovernanceSubpage.Propose &&
              (!address ||
                !coreTeamAddresses.includes(standardiseAddress(address)))
            ) {
              return null;
            }
            return (
              <H5
                key={i}
                className={`pb-2 w-fit ${
                  subpage === subpageCurrent
                    ? "border-dark-primary border-b-[1px]"
                    : "text-dark-tertiary cursor-pointer"
                }`}
                onClick={() => handleNavigateClick(subpageCurrent)}
              >
                {subpageCurrent === GovernanceSubpage.Voting && "Voting"}
                {subpageCurrent === GovernanceSubpage.Staking && "Staking"}
                {subpageCurrent === GovernanceSubpage.Propose && "Propose"}
              </H5>
            );
          })}
        </div>
        {subpage === GovernanceSubpage.Voting && <VotingSubpage />}
        {subpage === GovernanceSubpage.Staking && <StakingSubpage />}
        {subpage === GovernanceSubpage.Propose && <ProposeOptionsSubpage />}
      </div>
    </Layout>
  );
};

export default GovernancePage;
