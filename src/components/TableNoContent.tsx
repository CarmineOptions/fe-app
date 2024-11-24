import styles from "../style/table.module.css";

type NoContentProps = {
  text: string;
};

export const NoContent = ({ text }: NoContentProps) => (
  <div className={styles.textcontainer}>{text}</div>
);
