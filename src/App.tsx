import { useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";

import { BraavosAnnounce } from "./components/Announce";
import { MultiDialog } from "./components/MultiDialog/MultiDialog";
import { isCookieSet } from "./utils/cookies";
import { StarknetProvider } from "./components/StarknetProvider";
import { queryClient } from "./queries/client";
import { store } from "./redux/store";
import {
  APYInfoPage,
  BattlechartsPage,
  GovernancePage,
  NotFoundPage,
  PointsPage,
  PortfolioPage,
  PriceProtectPage,
  PriceProtectVideoPage,
  SettingsPage,
  StakingExplainedPage,
  SwapPage,
  TermsAndConditionsPage,
  TradePage,
  TradeDashboardPage,
  YieldPage,
} from "./pages";
import { initCarmineSdk } from "carmine-sdk/core";

const App = () => {
  const [check, rerender] = useState(false);
  const acceptedTermsAndConditions = isCookieSet("carmine-t&c");
  const oldPathRedirects = [
    ["/position", "/portfolio"],
    ["/history", "/portfolio#history"],
    ["/staking", "/yield"],
    ["/rewards", "/portfolio/airdrops"],
  ];
  initCarmineSdk({ rpcUrl: "https://api.carmine.finance/api/v1/mainnet/call" });

  return (
    <Provider store={store}>
      <StarknetProvider>
        <QueryClientProvider client={queryClient}>
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
                  <Route
                    path="/portfolio/:target?"
                    element={<PortfolioPage />}
                  />
                  <Route path="/swap" element={<SwapPage />} />
                  <Route
                    path="/staking-explained"
                    element={<StakingExplainedPage />}
                  />
                  <Route path="/apy-info" element={<APYInfoPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/dashboard" element={<TradeDashboardPage />} />
                  <Route
                    path="/governance/:target?"
                    element={<GovernancePage />}
                  />
                  <Route path="/leaderboard" element={<PointsPage />} />
                  <Route path="/battlecharts" element={<BattlechartsPage />} />
                  <Route path="/priceprotect" element={<PriceProtectPage />} />
                  <Route path="/yield" element={<YieldPage />} />
                  <Route
                    path="/price-protect-video"
                    element={<PriceProtectVideoPage />}
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Router>
              <MultiDialog />
              <Toaster
                position="bottom-left"
                reverseOrder={false}
                toastOptions={{
                  style: { background: "#333", color: "white" },
                }}
              />
              <BraavosAnnounce />
            </>
          ) : (
            <TermsAndConditionsPage check={check} rerender={rerender} />
          )}
        </QueryClientProvider>
      </StarknetProvider>
    </Provider>
  );
};

export default App;
