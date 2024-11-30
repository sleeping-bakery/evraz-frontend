import { ConfigProvider } from "antd";
import Main from "./features/Main";

function App() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            defaultBg: "#171717",
            defaultBorderColor: "#F57F29",
            defaultColor: "#FFFFFF",
            defaultActiveColor: "#FFFFFF",
            defaultActiveBg: "#F57F29",
            defaultActiveBorderColor: "#F57F29",
            defaultHoverBg: "#F57F29",
            defaultHoverColor: "#FFFFFF",
            defaultHoverBorderColor: "#F57F29",
          },
          Input: {
            colorText: "#FFFFFF",
            colorTextBase: "#FFFFFF",
            colorTextPlaceholder: "#FFFFFF",
          },
        },
      }}
    >
      <Main />
    </ConfigProvider>
  );
}

export default App;
