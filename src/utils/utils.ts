import { ExplorerProvider, NetworkId, NodeProvider } from "@alephium/web3"

const mainnet_node_url = "https://wallet-v20.mainnet.alephium.org"
const testnet_node_url = "https://wallet-v20.testnet.alephium.org"
const devnet_node_url = "http://127.0.0.1:22973"
const mainnet_explorer_url = "https://backend-v113.mainnet.alephium.org"
const testnet_explorer_url = "https://backend-v113.testnet.alephium.org"
const devnet_explorer_url = "http://127.0.0.1:9090"

export function connectAlephium(network: NetworkId): NodeProvider {
  return new NodeProvider(network === "mainnet" ? mainnet_node_url : network === "testnet" ? testnet_node_url : devnet_node_url)
}

export function connectExplorer(network: NetworkId): ExplorerProvider {
  return new ExplorerProvider(network === "mainnet" ? mainnet_explorer_url : network === "testnet" ? testnet_explorer_url : devnet_explorer_url)
}
