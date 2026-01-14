import { AppShell, Footer, Text, useMantineTheme } from '@mantine/core'
import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import NavbarNested from './AppNavBar'
import AppHeader from './AppHeader'
import WalletInfo from './Wallet/WalletInfo'
import { WIP } from './Misc/WIP'
import SignMessage from './Misc/SignMessage'
import TokenInfo from './Token/TokenInfo'
import CreateMultisig from './Multisig/CreateMultisig'
import ImportMultisig from './Multisig/ImportMultisig'
import ShowMultiSig from './Multisig/ShowMultisig'
import SignMultisigTx from './Multisig/SignMultisigTx'
import BuildMultisigTx from './Multisig/BuildMultisigTx'
import NewToken from './Token/NewToken'

function AppShellExample() {
  const theme = useMantineTheme()
  const [navbarOpened, setNavbarOpened] = useState(false)

  return (
    <Router>
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
            minHeight: '100vh',
            paddingTop: '60px !important',
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        padding={0}
        navbar={<NavbarNested hidden={!navbarOpened} onLinkClick={() => setNavbarOpened(false)} />}
        footer={
          <Footer height={60} p="md">
            <Text fw="bold" fz="sm">
              Powered by BlockFlow, Stateful UTXO, PoLW
            </Text>
          </Footer>
        }
        header={<AppHeader navbarOpened={navbarOpened} setNavbarOpened={setNavbarOpened} />}
      >
        <Routes>
          <Route path="/" element={<WalletInfo />} />
          <Route path="/sign-message" element={<SignMessage />} />
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
          <Route path="/multisig/import" element={<ImportMultisig />} />
          <Route path="/multisig/show" element={<ShowMultiSig />} />
          <Route path="/multisig/build-tx" element={<BuildMultisigTx />} />
          <Route path="/multisig/sign-tx" element={<SignMultisigTx />} />
        </Routes>
      </AppShell>
    </Router>
  )
}

export default AppShellExample
