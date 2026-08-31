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
  GovernancePage,
  NotFoundPage,
  PortfolioPage,
  SettingsPage,
  StakingExplainedPage,
  TermsAndConditionsPage,
  YieldPage,
} from "./pages";
import { initCarmineSdk } from "@carmine-options/sdk/core";
import { RPC_URL } from "./constants/amm";

const App = () => {
  const [check, rerender] = useState(false);
  const acceptedTermsAndConditions = isCookieSet("carmine-t&c");
  const oldPathRedirects = [
    ["/position", "/portfolio"],
    ["/history", "/portfolio#history"],
    ["/staking", "/yield"],
    ["/rewards", "/portfolio/airdrops"],
  ];
  initCarmineSdk({ rpcUrl: RPC_URL });

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
                  <Route path="/" element={<YieldPage />} />
                  <Route
                    path="/portfolio/:target?"
                    element={<PortfolioPage />}
                  />
                  <Route
                    path="/staking-explained"
                    element={<StakingExplainedPage />}
                  />
                  <Route path="/apy-info" element={<APYInfoPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route
                    path="/governance/:target?"
                    element={<GovernancePage />}
                  />
                  <Route path="/yield" element={<YieldPage />} />
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
