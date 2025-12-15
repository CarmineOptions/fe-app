import { Close } from "@mui/icons-material";
import { TokenNamedBadge } from "../TokenBadge";
import { allTokens, Token } from "@carmine-options/sdk/core";

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

export const TokenSelect = ({ close, setSelection, other }: Props) => {
  return (
    <div className="absolute top-0 left-0 right-0 bg-dark-container border-white border-2 z-10 rounded-md p-5">
      <div className="flex justify-between items-center">
        <h2>Select a token</h2>
        <div onClick={close}>
          <Close />
        </div>
      </div>
      {allTokens.map((token, i) => {
        if (token.address === other.address) {
          // do not show the other part of the pair
          return null;
        }
        return (
          <div
            className="cursor-pointer p-3"
            onClick={() => {
              setSelection(token);
              close();
            }}
            key={i}
          >
            <TokenNamedBadge token={token} />
          </div>
        );
      })}
    </div>
  );
};
