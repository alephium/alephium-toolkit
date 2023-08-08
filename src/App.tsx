import "./App.css";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
  Paper,
} from "@mantine/core";
import { useLocalStorage, useHotkeys } from "@mantine/hooks";
import AppShellExample from "./components/AppShell";

import { AlephiumWalletProvider } from '@alephium/web3-react'

function App() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  return (
    <AlephiumWalletProvider useTheme="rounded" network="mainnet" addressGroup={0}>
      <div className="App">
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme }}>
            <Paper>
              <AppShellExample />
            </Paper>
          </MantineProvider>
        </ColorSchemeProvider>
      </div>
    </AlephiumWalletProvider>
  );
}

export default App;
