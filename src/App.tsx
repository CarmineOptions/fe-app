import { CssBaseline } from "@mui/material";
import { useState } from "react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { AlphaRibbon } from "./components/AlphaRibbon/AlphaRibbon";
import { MultiDialog } from "./components/MultiDialog/MultiDialog";
import { Toast } from "./components/Toast/Toast";
import { Controller } from "./Controller";
import APYInfoPage from "./pages/apyInfo";
import BalancePage from "./pages/balance";
import TradeDashboardPage from "./pages/dashboard";
import Governance from "./pages/governance";
import HistoryPage from "./pages/history";
import Insurance from "./pages/insurance";
import NotFound from "./pages/notFound";
import Settings from "./pages/settings";
import StakePage from "./pages/stake";
import StakingExplainedPage from "./pages/stakeInfo";
import TermsAndConditions from "./pages/termsAndConditions";
import TradePage from "./pages/trade";
import { store } from "./redux/store";
import { isCookieSet } from "./utils/cookies";

const App = () => {
  const [check, rerender] = useState(false);

  const acceptedTermsAndConditions = isCookieSet("carmine-t&c");

  return (
    <Provider store={store}>
      <Controller>
        <CssBaseline />
        {acceptedTermsAndConditions ? (
          <>
            <Router>
              <Routes>
                <Route path="/" element={<TradePage />} />
                <Route path="/trade" element={<TradePage />} />
                <Route path="/insurance" element={<Insurance />} />
                <Route path="/position" element={<BalancePage />} />
                <Route path="/staking" element={<StakePage />} />
                <Route
                  path="/staking-explained"
                  element={<StakingExplainedPage />}
                />
                <Route path="/apy-info" element={<APYInfoPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<TradeDashboardPage />} />
                <Route path="/governance" element={<Governance />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <MultiDialog />
            <Toast />
            <AlphaRibbon />
          </>
        ) : (
          <TermsAndConditions check={check} rerender={rerender} />
        )}
      </Controller>
    </Provider>
  );
};

export default App;
