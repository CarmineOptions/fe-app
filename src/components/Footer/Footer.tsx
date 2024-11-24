import styles from "./footer.module.css";

type LinkProps = {
  href: string;
  txt: string;
};

const Link = ({ href, txt }: LinkProps) => (
  <a className={styles.link} href={href} target="_blank" rel="noreferrer">
    {txt}
  </a>
);

export const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.company}>Carmine Finance</div>
      <table className={styles.table}>
        <tbody>
          <tr>
            <td>
              <Link
                // TODO: add correct link
                href={"https://carmine.finance/"}
                txt="Developers"
              />
            </td>
            <td>
              <Link href={"https://github.com/CarmineOptions"} txt="Github" />
            </td>
          </tr>
          <tr>
            <td>
              <Link
                href={"https://docs.carmine.finance/carmine-options-amm/"}
                txt="Documentation"
              />
            </td>
            <td>
              <Link href={"https://discord.gg/uRs7j8w3bX"} txt="Discord" />
            </td>
          </tr>
          <tr>
            <td>
              <Link // TODO: add correct link
                href={"https://carmine.finance/"}
                txt="About"
              />
            </td>
            <td>
              <Link href={"https://twitter.com/CarmineOptions"} txt="Twitter" />
            </td>
          </tr>
        </tbody>
      </table>
      <div className={styles.bottom}>
        <span>© Carmine Finance, 2023, All Rights Reserved</span>
        <Link
          href={"https://carmine.finance/audit/hack-a-chain"}
          txt="Audit by Hack a Chain"
        />
      </div>
    </div>
  );
};
