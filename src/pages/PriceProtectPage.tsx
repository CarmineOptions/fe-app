import { Helmet } from "react-helmet";
import { Layout } from "../components/Layout";
import { UserPriceGuard, PriceGuard } from "../components/PriceGuard";
import { openPopupWindow, PopupConfig } from "../components/Popup";
import { H4 } from "../components/common";

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

const PriceProtectPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Price Protect | Carmine Options AMM</title>
        <meta
          name="description"
          content="Protect the price of your crypto assets"
        />
      </Helmet>
      <div className="flex flex-col gap-10">
        <H4
          className="cursor-pointer"
          onClick={() => {
            const cfg = getVideoPopupConfig();
            openPopupWindow(cfg);
          }}
        >
          Price Protect
        </H4>
        <PriceGuard />
        <UserPriceGuard />
      </div>
    </Layout>
  );
};

export default PriceProtectPage;
