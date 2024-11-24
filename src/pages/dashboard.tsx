import { Helmet } from "react-helmet";
import { Header } from "../components/Header/Header";
import { isDev } from "../utils/utils";

const TradeDashboardPage = () => {
  const header = document.querySelector("header");
  const headerHeight = header ? header.offsetHeight + 8 : 80;
  const height = `calc(100vh - ${headerHeight}px)`;

  const url = isDev
    ? "https://dashboard.carmine-dev.eu/"
    : "https://dashboard.carmine.finance/";

  return (
    <>
      <Helmet>
        <title>Dashboard | Carmine Options AMM</title>
        <meta
          name="description"
          content="See statistics and historic data of Carmine Options AMM"
        />
      </Helmet>
      <Header />
      <iframe
        title="trading dashboard"
        frameBorder="0"
        width="100%"
        style={{ height }}
        src={url}
      ></iframe>
    </>
  );
};

export default TradeDashboardPage;
