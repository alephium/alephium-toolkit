import './App.css'
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
  Paper,
} from '@mantine/core'
import { useLocalStorage, useHotkeys } from '@mantine/hooks'
import AppShellExample from './components/AppShell'

import { AlephiumWalletProvider } from '@alephium/web3-react'
import { loadNetworkIdFromLocalStorage } from './utils/utils'
import { useMemo } from 'react'

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: false,
  })
  const initialNetwork = useMemo(() => loadNetworkIdFromLocalStorage(), [])

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'))

  useHotkeys([['mod+J', () => toggleColorScheme()]])

  return (
    <AlephiumWalletProvider
      theme={colorScheme === 'dark' ? 'retro' : 'nouns'}
      network={initialNetwork}
    >
      <div className="App">
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{ colorScheme }}
          >
            <Paper>
              <AppShellExample />
            </Paper>
          </MantineProvider>
        </ColorSchemeProvider>
      </div>
    </AlephiumWalletProvider>
  )
}

export default App
