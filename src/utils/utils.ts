import {
  TokenList,
  mainnetTokensMetadata,
  testnetTokensMetadata,
} from '@alephium/token-list'
import { ExplorerProvider, NetworkId, NodeProvider, web3 } from '@alephium/web3'
import { useWalletConfig } from '@alephium/web3-react'
import { useEffect, useMemo } from 'react'

const mainnet_node_url = 'https://wallet-v20.mainnet.alephium.org'
const testnet_node_url = 'https://wallet-v20.testnet.alephium.org'
const devnet_node_url = 'http://127.0.0.1:22973'
const mainnet_explorer_backend_url = 'https://backend-v113.mainnet.alephium.org'
const testnet_explorer_backend_url = 'https://backend-v113.testnet.alephium.org'
const devnet_explorer_backend_url = 'http://127.0.0.1:9090'
const mainnet_explorer_url = 'https://explorer.alephium.org'
const testnet_explorer_url = 'https://testnet.alephium.org'
const devnet_explorer_url = 'http://localhost:23000'

const networkStorageKey = 'alephium-network'

export function loadNetworkIdFromLocalStorage(): NetworkId {
  const network = localStorage.getItem(networkStorageKey)
  if (network === 'mainnet' || network === 'testnet' || network === 'devnet') {
    return network
  }
  return 'mainnet'
}

export function saveNetworkIdToLocalStorage(network: NetworkId): void {
  localStorage.setItem(networkStorageKey, network)
}

export function useNetworkId(): [NetworkId, (network: NetworkId) => void] {
  const { network, setNetwork } = useWalletConfig()

  useEffect(() => {
    saveNetworkIdToLocalStorage(network)
  }, [network])

  return [network, setNetwork]
}

export function useAlephium(): NodeProvider {
  const [network] = useNetworkId()
  const nodeProvider = useMemo(
    () =>
      new NodeProvider(
        network === 'mainnet'
          ? mainnet_node_url
          : network === 'testnet'
          ? testnet_node_url
          : devnet_node_url
      ),
    [network]
  )

  useEffect(() => {
    web3.setCurrentNodeProvider(nodeProvider)
  }, [nodeProvider])

  return nodeProvider
}

export function useExplorer(): ExplorerProvider {
  const [network] = useNetworkId()
  const explorerProvider = useMemo(() => new ExplorerProvider(
    network === 'mainnet'
      ? mainnet_explorer_backend_url
      : network === 'testnet'
      ? testnet_explorer_backend_url
      : devnet_explorer_backend_url
  ), [network])

  useEffect(() => {
    web3.setCurrentExplorerProvider(explorerProvider)
  }, [ExplorerProvider])

  return explorerProvider
}

export function useExplorerFE(): string {
  const [network] = useNetworkId()
  return network === 'mainnet'
    ? mainnet_explorer_url
    : network === 'testnet'
    ? testnet_explorer_url
    : devnet_explorer_url
}

export function getTokenMetadata(network: 'mainnet' | 'testnet'): TokenList {
  return network === 'mainnet' ? mainnetTokensMetadata : testnetTokensMetadata
}

function isObject(object: any): boolean {
  return object != null && typeof object === 'object'
}

export function isDeepEqual(object1: any, object2: any): boolean {
  const objKeys1 = Object.keys(object1)
  const objKeys2 = Object.keys(object2)

  if (objKeys1.length !== objKeys2.length) return false

  for (const key of objKeys1) {
    const value1 = object1[key]
    const value2 = object2[key]

    const isObjects = isObject(value1) && isObject(value2)

    if (
      (isObjects && !isDeepEqual(value1, value2)) ||
      (!isObjects && value1 !== value2)
    ) {
      return false
    }
  }
  return true
}
