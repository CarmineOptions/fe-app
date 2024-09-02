import { Token, TokenKey } from "../../classes/Token";
import { Close } from "@mui/icons-material";

import styles from "./widget.module.css";

export type SelectableToken = {
  icon: string;
  name: string;
  address: string;
};

type Props = {
  setSelection: (t: Token) => void;
  close: () => void;
  other: Token;
};

export const TokenDisplay = ({ token }: { token: Token }) => {
  return (
    <div className={styles.tokendisplay}>
      <img
        width="40px"
        height="40px"
        src={token.icon}
        alt={`${token.symbol} logo`}
      />
      {token.symbol}
    </div>
  );
};

export const TokenSelect = ({ close, setSelection, other }: Props) => {
  return (
    <div className={styles.modalcontainer}>
      <div className={styles.modalheader}>
        <h1>Select a token</h1>
        <div onClick={close}>
          <Close />
        </div>
      </div>
      {Object.values(TokenKey).map((tokenKey, i) => {
        const token = Token.byKey(tokenKey);
        if (token.address === other.address) {
          // do not show the other part of the pair
          return null;
        }
        return (
          <div
            className={styles.row}
            onClick={() => {
              setSelection(token);
              close();
            }}
            key={i}
          >
            <TokenDisplay token={token} />
          </div>
        );
      })}
    </div>
  );
};
