import { Tooltip } from "@mui/material";
import { ReactElement, ReactNode } from "react";

import styles from "./defispring.module.css";
import { StarknetIcon } from "../Icons";

type DefiSpringTooltipProps = {
  children: ReactElement<any, any>;
  title: ReactNode;
};

type DefiSpringStakingMessageProps = {
  apy: number;
  defispringApy: number;
};

type DefiSpringShortsMessageProps = {
  defispringApy?: number;
};

export const DefiSpringShortsMessage = ({
  defispringApy,
}: DefiSpringShortsMessageProps) => {
  return (
    <div>
      <div className={styles.heading}>
        <h4>DefiSpring Incentive</h4>
        <StarknetIcon />
      </div>
      <div>
        <div className={styles.apart}>
          <p>STRK DeFi Spring rewards</p>
          <p>
            <b>{defispringApy?.toFixed(2)}%</b>
          </p>
        </div>
      </div>
      <p>
        Shorts are contributing liquidity to the Carmine Options AMM and are
        thus eligible for the STRK DeFi Spring rewards.
      </p>
      <p>
        The estimation of the DeFi Spring rewards is based on the allocation
        from yesterday. Should there be a substantial increase in capital, these
        figures may become distorted.
      </p>
    </div>
  );
};

export const DefiSpringStakingMessage = ({
  apy,
  defispringApy,
}: DefiSpringStakingMessageProps) => {
  return (
    <div>
      <div className={styles.heading}>
        <h4>DefiSpring Incentive</h4>
        <StarknetIcon />
      </div>
      <div>
        <div className={styles.apart}>
          <p>Supply APY</p>
          <p>
            <b>{apy.toFixed(2)}%</b>
          </p>
        </div>
        <div className={styles.apart}>
          <p>STRK DeFi Spring rewards</p>
          <p>
            <b>{defispringApy.toFixed(2)}%</b>
          </p>
        </div>
      </div>
      <p>
        The estimate of the DeFi Spring rewards is based on yesterday's
        allocation. In case there is big increase of capital, this number will
        be skewed.
      </p>
    </div>
  );
};

export const DefiSpringTooltip = ({
  children,
  title,
}: DefiSpringTooltipProps) => (
  <Tooltip
    title={title}
    classes={{
      tooltip: styles.tooltip,
    }}
    componentsProps={{
      tooltip: {
        sx: {
          bgcolor: "rgba(12, 12, 79, .8)",
        },
      },
    }}
  >
    {children}
  </Tooltip>
);
