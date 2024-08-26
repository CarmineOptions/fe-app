import { CssBaseline } from "@mui/material";
import { useState } from "react";
import { Provider } from "react-redux";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import { BraavosAnnounce } from "./components/Announce";
import { MultiDialog } from "./components/MultiDialog/MultiDialog";
import { Toast } from "./components/Toast/Toast";
import { Controller } from "./Controller";
import TermsAndConditions from "./pages/termsAndConditions";
import { store } from "./redux/store";
import { isCookieSet } from "./utils/cookies";

import TradePage from "./pages/trade";
import APYInfoPage from "./pages/apyInfo";
import TradeDashboardPage from "./pages/dashboard";
import Governance from "./pages/governance";
import NotFound from "./pages/notFound";
import Portfolio from "./pages/portfolio";
import Settings from "./pages/settings";
import StakePage from "./pages/stake";
import StakingExplainedPage from "./pages/stakeInfo";
import LeaderboardPage from "./pages/leaderboard";
import StarknetRewards from "./pages/starknetRewards";
import BattlechartsPage from "./pages/battlecharts";
import PriceGuardPage from "./pages/priceGuard";

import "./style/base.css";
import YieldPage from "./pages/yield";
import SwapPage from "./pages/swap";

const App = () => {
  const [check, rerender] = useState(false);
  const acceptedTermsAndConditions = isCookieSet("carmine-t&c");
  const oldPathRedirects = [
    ["/position", "/portfolio"],
    ["/history", "/portfolio#history"],
  ];

  return (
    <Provider store={store}>
      <Controller>
        <CssBaseline />
        {acceptedTermsAndConditions ? (
          <>
            <Router>
              <Routes>
                {oldPathRedirects.map(([oldPath, newPath], i) => (
                  <Route
                    key={i}
                    path={oldPath}
                    element={<Navigate to={newPath} replace />}
                  />
                ))}
                <Route path="/" element={<TradePage />} />
                <Route path="/trade" element={<TradePage />} />
                {/* <Route path="/priceGuard" element={<PriceGuard />} /> */}
                <Route path="/portfolio/:target?" element={<Portfolio />} />
                <Route path="/staking" element={<StakePage />} />
                <Route path="/swap" element={<SwapPage />} />
                <Route
                  path="/staking-explained"
                  element={<StakingExplainedPage />}
                />
                <Route path="/apy-info" element={<APYInfoPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<TradeDashboardPage />} />
                <Route path="/governance/:target?" element={<Governance />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/rewards" element={<StarknetRewards />} />
                <Route path="/battlecharts" element={<BattlechartsPage />} />
                <Route path="/priceprotect" element={<PriceGuardPage />} />
                <Route path="/yield" element={<YieldPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <MultiDialog />
            <Toast />
            <BraavosAnnounce />
          </>
        ) : (
          <TermsAndConditions check={check} rerender={rerender} />
        )}
      </Controller>
    </Provider>
  );
};

export default App;
