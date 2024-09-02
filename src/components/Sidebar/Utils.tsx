import styles from "./utils.module.css";

type BoxTwoValuesConfig = {
  size?: "small";
  bottomColor?: "white";
};

type BoxTwoValuesProps = {
  title: string;
  topValue: string;
  bottomValue: string;
  conf?: BoxTwoValuesConfig;
};

export const BoxTwoValues = ({
  title,
  topValue,
  bottomValue,
  conf,
}: BoxTwoValuesProps) => {
  const { size, bottomColor } = conf || {};
  const className = size
    ? styles.twovaluebox + " " + styles[size]
    : styles.twovaluebox;
  return (
    <div className={className}>
      <span>{title}</span>
      <div>
        <span className={styles.top}>{topValue}</span>
        <span
          className={
            styles.bottom +
            (bottomColor === undefined ? "" : ` ${styles[bottomColor]}`)
          }
        >
          {bottomValue}
        </span>
      </div>
    </div>
  );
};
