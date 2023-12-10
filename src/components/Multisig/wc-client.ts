import {
  PROVIDER_NAMESPACE,
  formatChain,
  parseChain,
  RelayMethod
} from '@alephium/walletconnect-provider'
import {
  Address,
  NetworkId,
  NodeProvider,
  groupOfAddress,
  SignExecuteScriptTxParams,
  ApiRequestArguments,
  ExplorerProvider,
  encodeMultisigPublicKeys
} from '@alephium/web3'
import SignClient from '@walletconnect/sign-client'
import {
  PairingTypes,
  SignClientTypes,
  EngineTypes
} from '@walletconnect/types'
import { MultisigConfig } from './shared'

export class WalletConnectClient {
  readonly networkId: NetworkId
  readonly nodeProvider: NodeProvider
  readonly explorerProvider: ExplorerProvider
  readonly multisigConfig: MultisigConfig & { address: Address }
  readonly signers: string[]
  readonly setUnsignedTx: (unsignedTx: string) => void
  readonly setBuildTxError: (error: string) => void

  public wcOptions?: SignClientTypes.Options
  public wcClient?: SignClient
  public pairingState?: PairingTypes.Struct
  public topic?: string

  static async init(
    multisigConfig: MultisigConfig & { address: Address },
    signers: string[],
    onTxBuilt: (unsignedTx: string) => void,
    setBuildTxError: (error: string) => void,
    networkId: NetworkId,
    nodeProvider: NodeProvider,
    explorerProvider: ExplorerProvider,
    wcOptions: SignClientTypes.Options
  ) {
    const client = new WalletConnectClient(
      multisigConfig,
      signers,
      onTxBuilt,
      setBuildTxError,
      networkId,
      nodeProvider,
      explorerProvider
    )

    client.wcOptions = wcOptions
    client.wcClient = await SignClient.init(wcOptions)
    client.registerEventListeners()

    return client
  }

  constructor(
    multisigConfig: MultisigConfig & { address: Address },
    signers: string[],
    setUnsignedTx: (unsignedTx: string) => void,
    setBuildTxError: (error: string) => void,
    networkId: NetworkId,
    nodeProvider: NodeProvider,
    explorerProvider: ExplorerProvider
  ) {
    this.multisigConfig = multisigConfig
    this.signers = signers
    this.setUnsignedTx = setUnsignedTx
    this.setBuildTxError = setBuildTxError
    this.networkId = networkId
    this.nodeProvider = nodeProvider
    this.explorerProvider = explorerProvider
  }

  async pair(url: string) {
    if (!this.wcClient) {
      throw new Error('WalletConnectClient not initialized')
    }

    console.log('pairing with url', url)
    this.pairingState = await this.wcClient.core.pairing.pair({ uri: url })
    console.log('pairingState', this.pairingState)
  }

  private registerEventListeners() {
    this.wcClient?.on('session_proposal', this.onSessionProposal)
    this.wcClient?.on('session_event', this.onSessionEvent)
    this.wcClient?.on('session_request', this.onSessionRequest)
    this.wcClient?.on('session_ping', this.onSessionPing)
    this.wcClient?.on('session_delete', this.onSessionDelete)
  }

  private onSessionProposal = async (
    proposal: SignClientTypes.EventArguments['session_proposal']
  ) => {
    if (!this.wcClient) {
      return
    }

    console.log('onSessionProposal', proposal)
    const { id, requiredNamespaces, relays } = proposal.params

    const requiredAlephiumNamespace = requiredNamespaces[PROVIDER_NAMESPACE]
    if (requiredAlephiumNamespace === undefined) {
      throw new Error(
        `${PROVIDER_NAMESPACE} namespace is required for session proposal`
      )
    }

    const requiredChains = requiredNamespaces[PROVIDER_NAMESPACE].chains || []
    if (requiredChains.length !== 1) {
      throw new Error(
        `Only single chain is allowed in ${PROVIDER_NAMESPACE} namespace during session proposal, proposed chains: ${requiredChains}`
      )
    }
    const requiredChain = requiredChains[0]
    const { networkId, addressGroup } = parseChain(requiredChain)
    if (networkId != this.networkId) {
      throw new Error(
        `Invalid networkId in ${PROVIDER_NAMESPACE} namespace in WalletConnect session, proposed networkId: ${networkId}, expected networkId: ${this.networkId}`
      )
    }
    const group = groupOfAddress(this.multisigConfig.address)
    if (addressGroup !== undefined && addressGroup !== groupOfAddress(this.multisigConfig.address)) {
      throw new Error(
        `Invalid addressGroup in ${PROVIDER_NAMESPACE} namespace in WalletConnect session, proposed networkId: ${addressGroup}, expected networkId: ${group}`
      )
    }

    const publicKeys = this.multisigConfig.pubkeys.map((p) => p.pubkey)
    const encodedPublicKey = encodeMultisigPublicKeys(publicKeys, this.multisigConfig.mOfN)
    const namespace = {
      methods: requiredAlephiumNamespace.methods,
      events: requiredAlephiumNamespace.events,
      accounts: [
        `${formatChain(networkId, addressGroup)}:${encodedPublicKey}/multisig`
      ],
    }
    const namespaces = { alephium: namespace }
    const { acknowledged } = await this.wcClient.approve({
      id,
      relayProtocol: relays[0].protocol,
      namespaces,
    })

    const session = await acknowledged()
    console.log('session', session)
    this.topic = session.topic
  }

  private onSessionEvent = async (
    event: SignClientTypes.EventArguments['session_event']
  ) => {
    console.log('onSessionEvent', event)
  }

  private async sendResponse(topic: string, response: EngineTypes.RespondParams['response']) {
    if (this.wcClient === undefined) {
      throw new Error(`Wallet is not connected`)
    }
    await this.wcClient.respond({ topic, response })
  }

  private onSessionRequest = async (
    request: SignClientTypes.EventArguments['session_request']
  ) => {
    if (this.topic === undefined || this.wcClient === undefined) {
      throw new Error(`Wallet is not connected`)
    }
    try {
      switch (request.params.request.method as RelayMethod) {
        case 'alph_signAndSubmitExecuteScriptTx': {
          const { tokens, bytecode, gasAmount, gasPrice, signerAddress, attoAlphAmount } =
            request.params.request.params as SignExecuteScriptTxParams

          if (signerAddress !== this.multisigConfig.address) {
            throw new Error(`Invalid signer address`)
          }
          const signerKeys = this.signers.map((signer) => this.multisigConfig.pubkeys.find((p) => p.name === signer)!).map((p) => p.pubkey)
          const result = await this.nodeProvider.contracts.postContractsUnsignedTxMultisigExecuteScript({
            fromAddress: this.multisigConfig.address,
            fromPublicKeys: signerKeys,
            bytecode: bytecode,
            attoAlphAmount: attoAlphAmount ? attoAlphAmount.toString() : undefined,
            tokens: tokens ? tokens.map((t) => ({ id: t.id, amount: t.amount.toString() })) : undefined,
            gasAmount: gasAmount,
            gasPrice: gasPrice ? gasPrice.toString() : undefined,
          })
          this.setUnsignedTx(result.unsignedTx)
          console.log(`unsigned tx: ${result.unsignedTx}`)
          await this.wcClient.reject({ id: request.id, reason: { code: -1, message: 'reject by toolkit' } })
          break
        }
        case 'alph_requestNodeApi': {
          const p = request.params.request.params as ApiRequestArguments
          const result: unknown = await this.nodeProvider.request(p)
          await this.sendResponse(request.topic, { id: request.id, jsonrpc: '2.0', result })
          break
        }
        case 'alph_requestExplorerApi': {
          const p = request.params.request.params as ApiRequestArguments
          const result: unknown = await this.explorerProvider.request(p)
          await this.sendResponse(request.topic, { id: request.id, jsonrpc: '2.0', result })
          break
        }
        default: {
          const error = { code: -1, message: `unsupported method ${request.params.request.method}` }
          await this.sendResponse(request.topic, { id: request.id, jsonrpc: '2.0', error })
        }
      }
    } catch (e: any) {
      const error = { code: -1, message: `error: ${e}` }
      this.setBuildTxError(`${e}`)
      await this.sendResponse(request.topic, { id: request.id, jsonrpc: '2.0', error })
    }
  }

  private onSessionPing = async (
    ping: SignClientTypes.EventArguments['session_ping']
  ) => {
    console.log('onSessionPing', ping)
  }

  private onSessionDelete = async (
    deleteEvent: SignClientTypes.EventArguments['session_delete']
  ) => {
    console.log('onSessionDelete', deleteEvent)
  }
}
