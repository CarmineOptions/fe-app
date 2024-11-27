import { Helmet } from "react-helmet";
import { setCookieWithExpiry } from "../utils/cookies";
import { Button, H4, P3 } from "../components/common";

const HIDE_TIME_MS = 12 * 60 * 60 * 1000; // 12 hours in ms

const storeTermsAndConditions = (
  check: boolean,
  rerender: (b: boolean) => void
) => {
  setCookieWithExpiry("carmine-t&c", "accepted", HIDE_TIME_MS);
  rerender(!check);
};

type Props = {
  rerender: (b: boolean) => void;
  check: boolean;
};

const TermsAndConditionsPage = ({ check, rerender }: Props) => {
  const termsUrl =
    "https://github.com/CarmineOptions/fe-app/blob/development/TermsOfUse.md";

  return (
    <div className="flex flex-col items-center justify-center h-dvh gap-2 px-8">
      <Helmet>
        <title>Terms & Conditions | Carmine Options AMM</title>
      </Helmet>
      <H4>Terms & Conditions</H4>
      <P3 className="max-w-[700px]">
        Please take a moment to review our terms and conditions, which govern
        the use of our service. You can access the{" "}
        <a
          className="underline"
          target="_blank"
          rel="noopener nofollow noreferrer"
          href={termsUrl}
        >
          document here
        </a>
        . It's important to read and understand these terms before using our
        service.
      </P3>
      <Button
        type="primary"
        onClick={() => storeTermsAndConditions(check, rerender)}
      >
        Accept Terms and Conditions
      </Button>
    </div>
  );
};

export default TermsAndConditionsPage;
