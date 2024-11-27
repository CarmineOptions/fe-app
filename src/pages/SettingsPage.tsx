import { CheckBox } from "../components/Settings/CheckBox";
import { Layout } from "../components/Layout";
import { H4, P3 } from "../components/common";

const SettingsPage = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-7">
        <H4>Settings</H4>
        <P3>
          The settings are stored in the localStorage - they are persistent per
          device and only if the usage of local storage is available.
        </P3>
        <CheckBox />
      </div>
    </Layout>
  );
};

export default SettingsPage;
