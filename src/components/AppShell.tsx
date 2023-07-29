import {
  AppShell,
  Footer,
  Text,
  useMantineTheme,
} from "@mantine/core";
import InputExample from "./InputExample";
import TextAndTitleExample from "./TextAndTitle";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavbarNested from "./AppNavBar";
import AppHeader from "./AppHeader";
import WalletInfo from "./Wallet/WalletInfo";
import { WIP } from "./Misc/WIP";

function AppShellExample() {
  const theme = useMantineTheme();

  return (
    <Router>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        navbar={
          <NavbarNested />
        }
        footer={
          <Footer height={60} p="md">
            <Text fz="sm">Powered by BlockFlow, Stateful UTXO, PoLW</Text>
          </Footer>
        }
        header={
          <AppHeader />
        }
      >
        <Routes>
          <Route path="/" element={<WalletInfo />} />
          <Route path="/token/all" element={<WIP />} />
          <Route path="/token/info" element={<WIP />} />
          <Route path="/token/new" element={<WIP />} />
          <Route path="/token/burn" element={<WIP />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default AppShellExample;
