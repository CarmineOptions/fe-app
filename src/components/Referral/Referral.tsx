import { useReducer } from "react";
import { useAccount } from "@starknet-react/core";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import styles from "./Referral.module.css";
import { showToast } from "../../redux/actions";
import { ToastType } from "../../redux/reducers/ui";
import { apiUrl } from "../../api";

enum ActionType {
  Fetching,
  Done,
  Error,
}

type Action = {
  type: ActionType;
  payload?: string;
};

type ReferralState = {
  fetching: boolean;
  referralCode?: string;
  error?: string;
};

type RefResult = { status: string; data?: string };

const initialState: ReferralState = {
  fetching: false,
};

const reducer = (state: ReferralState, action: Action) => {
  switch (action.type) {
    case ActionType.Fetching:
      return { fetching: true };
    case ActionType.Done:
      return { fetching: false, referralCode: action.payload };
    case ActionType.Error:
      return { fetching: false, error: action.payload };
    default:
      return state;
  }
};

const ReferralLink = ({ code }: { code: string }) => {
  const link = `https://app.carmine.finance?ref_code=${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    showToast("Referral link copied", ToastType.Success);
  };

  return (
    <div className={styles.linkcontainer}>
      <div className={styles.link}>{link}</div>
      <div
        className={`${styles.iconbutton} ${styles.link}`}
        onClick={handleCopy}
      >
        <ContentCopyIcon />
      </div>
    </div>
  );
};

const GetReferralLink = () => {
  const { account } = useAccount();
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleClick = () => {
    if (!account) {
      dispatch({
        type: ActionType.Error,
        payload: "Could not read user address",
      });
      return;
    }
    dispatch({ type: ActionType.Fetching });
    const url = apiUrl(`get_referral?address=${account.address}`);
    fetch(url)
      .then((res) => res.json())
      .then((resBody: RefResult) => {
        if (resBody && resBody.status === "success" && resBody.data) {
          dispatch({ type: ActionType.Done, payload: resBody.data });
        } else {
          dispatch({
            type: ActionType.Error,
            payload: "Failed getting referral link",
          });
        }
      })
      .catch((e) => {
        console.error(e);
        dispatch({ type: ActionType.Error, payload: e });
      });
  };

  if (!account) {
    return <p>Connect wallet to generate referral code</p>;
  }

  if (state.fetching) {
    return <p>Getting your referral link...</p>;
  }

  if (state.error) {
    return <p>Error: {state.error}</p>;
  }

  if (state.referralCode) {
    return <ReferralLink code={state.referralCode} />;
  }

  return (
    <button className="primary active" onClick={handleClick}>
      Generate referral link
    </button>
  );
};

export const Referral = () => <GetReferralLink />;
