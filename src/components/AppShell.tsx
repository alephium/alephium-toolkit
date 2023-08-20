import {
  AppShell,
  Footer,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavbarNested from "./AppNavBar";
import AppHeader from "./AppHeader";
import WalletInfo from "./Wallet/WalletInfo";
import { WIP } from "./Misc/WIP";
import TokenInfo from "./Token/TokenInfo";
import NewToken from "./Token/NewToken";
import { useAlephiumConnectContext } from "@alephium/web3-react";
import { useEffect } from "react";
import { web3 } from "@alephium/web3";
import CreateMultisig from "./Multisig/CreateMultisig";

function AppShellExample() {
  const theme = useMantineTheme();
  const context = useAlephiumConnectContext()
  
  useEffect(() => {
    if (context.signerProvider?.nodeProvider !== undefined) {
      web3.setCurrentNodeProvider(context.signerProvider.nodeProvider)
    }
  }, [context.signerProvider])

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
            <Text fw="bold" fz="sm">Powered by BlockFlow, Stateful UTXO, PoLW</Text>
          </Footer>
        }
        header={
          <AppHeader />
        }
      >
        <Routes>
          <Route path="/" element={<WalletInfo />} />
          <Route path="/token/all" element={<WIP />} />
          <Route path="/token/info" element={<TokenInfo />} />
          <Route path="/token/new" element={<NewToken />} />
          <Route path="/token/burn" element={<WIP />} />
          <Route path="/nft/all" element={<WIP />} />
          <Route path="/nft/info" element={<WIP />} />
          <Route path="/nft/new-collection" element={<WIP />} />
          <Route path="/nft/burn" element={<WIP />} />
          <Route path="/contract/play" element={<WIP />} />
          <Route path="/contract/info" element={<WIP />} />
          <Route path="/contract/deploy" element={<WIP />} />
          <Route path="/multisig" element={<WIP />} />
          <Route path="/multisig/create" element={<CreateMultisig />} />
          <Route path="/multisig/import" element={<WIP />} />
          <Route path="/multisig/show" element={<WIP />} />
          <Route path="/multisig/tx" element={<WIP />} />
        </Routes>
      </AppShell>
    </Router>
  );
}

export default AppShellExample;
