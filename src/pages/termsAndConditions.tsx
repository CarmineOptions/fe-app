import { Helmet } from "react-helmet";
import { Link } from "@mui/material";
import { setCookieWithExpiry } from "../utils/cookies";

import styles from "./t&c.module.css";

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

const TermsAndConditions = ({ check, rerender }: Props) => {
  const termsUrl =
    "https://github.com/CarmineOptions/fe-app/blob/development/TermsOfUse.md";

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Terms & Conditions | Carmine Options AMM</title>
      </Helmet>
      <h1 className="botmargin">Terms & Conditions</h1>
      <p className="botmargin">
        Please take a moment to review our terms and conditions, which govern
        the use of our service. You can access the{" "}
        <Link color="inherit" href={termsUrl}>
          document here
        </Link>
        . It's important to read and understand these terms before using our
        service.
      </p>
      <button
        className="primary active"
        onClick={() => storeTermsAndConditions(check, rerender)}
      >
        Accept Terms and Conditions
      </button>
    </div>
  );
};

export default TermsAndConditions;
