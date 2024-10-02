/* eslint-disable no-unreachable */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { UserPriceGuard, PriceGuard } from "../components/PriceGuard";
import { openPopupWindow, PopupConfig } from "../components/Popup";

const getVideoPopupConfig = (): PopupConfig => {
  const url = "/price-protect-video";

  const defaultWidth = 987;
  const defaultHeight = 555;
  const aspectRatio = defaultWidth / defaultHeight;
  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width >= defaultWidth && height >= defaultHeight) {
    return {
      url,
      width: defaultWidth,
      height: defaultHeight,
    };
  }

  const widthBasedHeight = width / aspectRatio;

  if (height >= widthBasedHeight) {
    return {
      url,
      width,
      height: widthBasedHeight,
    };
  }

  const heightBasedWidth = height * aspectRatio;

  return {
    url,
    width: heightBasedWidth,
    height,
  };
};

const PriceGuardPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Price Protect | Carmine Options AMM</title>
        <meta
          name="description"
          content="Protect the price of your crypto assets"
        />
      </Helmet>
      <h1>Price Protect</h1>
      <p>
        Safeguard your holdings from major price movement.{" "}
        <a
          rel="noopener nofollow noreferrer"
          target="_blank"
          href="#"
          onClick={() => {
            const cfg = getVideoPopupConfig();
            console.log(cfg);
            openPopupWindow(cfg);
          }}
        >
          Learn more
        </a>
      </p>
      <PriceGuard />
      <UserPriceGuard />
    </Layout>
  );
};

export default PriceGuardPage;
