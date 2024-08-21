import { TableWrapper } from "../TableWrapper/TableWrapper";
import { PoolCard } from "./PoolCard";
import { PoolList } from "./PoolList";
import { StakeCapitalParent } from "./StakeCapitalParent";

const StakeCapital = () => (
  <TableWrapper>
    <StakeCapitalParent />
  </TableWrapper>
);

export default StakeCapital;

export { PoolCard, PoolList };
