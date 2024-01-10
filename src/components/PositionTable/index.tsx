import { FunctionComponent } from "react";
import { useQuery } from "react-query";

import { OptionWithPosition } from "../../classes/Option";
import { useAccount } from "../../hooks/useAccount";
import { QueryKeys } from "../../queries/keys";
import { LoadingAnimation } from "../Loading/Loading";
import { NoContent } from "../TableNoContent";
import { TableWrapper } from "../TableWrapper/TableWrapper";
import { fetchPositions } from "./fetchPositions";
import { InMoneyItem } from "./InMoneyItem";
import { LiveItem } from "./LiveItem";
import { OutOfMoneyItem } from "./OutOfMoneyItem";
import { TableElement } from "./TableElement";

type PositionsTemplateProps = {
  Live: FunctionComponent;
  InMoney: FunctionComponent;
  OutOfMoney: FunctionComponent;
};

const PositionsTemplate = ({
  Live,
  InMoney,
  OutOfMoney,
}: PositionsTemplateProps) => (
  <div>
    <h3>Options Balance</h3>
    <TableWrapper slippage>
      <Live />
    </TableWrapper>
    <h3>Expired - Profit</h3>
    <p style={{ maxWidth: "66ch" }}>
      These options matured in the money and you will get your funds upon
      settling.
    </p>
    <TableWrapper>
      <InMoney />
    </TableWrapper>
    <h3>Expired - No Profit</h3>
    <p style={{ maxWidth: "66ch" }}>
      These options matured out of the money, you will not receive any funds
      from settling them. Settling these options will simply remove them.
    </p>
    <TableWrapper>
      <OutOfMoney />
    </TableWrapper>
  </div>
);

type PropsAddress = {
  address: string;
};

const PositionsWithAddress = ({ address }: PropsAddress) => {
  const { isLoading, isError, isFetching, data } = useQuery(
    [QueryKeys.position, address],
    fetchPositions
  );

  if (isError) {
    const child = () =>
      NoContent({
        text: "Something went wrong while getting your positions, please try again later",
      });
    return (
      <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
    );
  }

  if (isLoading || !data) {
    const child = () => (
      <div style={{ padding: "20px" }}>
        <LoadingAnimation size={40} />
      </div>
    );
    return (
      <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
    );
  }

  const liveOptions = data.filter(
    (option: OptionWithPosition) => option.isFresh
  );

  const inOptions = data.filter(
    (option: OptionWithPosition) => option.isInTheMoney
  );

  const outOptions = data.filter(
    (option: OptionWithPosition) => option.isOutOfTheMoney
  );

  return (
    <PositionsTemplate
      Live={() =>
        TableElement({
          isFetching,
          data: liveOptions,
          titles: ["Option", "Maturity", "Size", "Value"],
          ItemElem: LiveItem,
          desc: "live",
        })
      }
      InMoney={() =>
        TableElement({
          isFetching,
          data: inOptions,
          titles: ["Option", "Expiry", "Size", "Value"],
          ItemElem: InMoneyItem,
          desc: "expired with profit",
        })
      }
      OutOfMoney={() =>
        TableElement({
          isFetching,
          data: outOptions,
          titles: ["Option", "Expiry", "Size"],
          ItemElem: OutOfMoneyItem,
          desc: "expired without profit",
        })
      }
    />
  );
};

export const Positions = () => {
  const account = useAccount();

  if (!account) {
    const child = () =>
      NoContent({ text: "Connect your wallet to see your positions" });
    return (
      <PositionsTemplate Live={child} InMoney={child} OutOfMoney={child} />
    );
  }

  return <PositionsWithAddress address={account.address} />;
};
