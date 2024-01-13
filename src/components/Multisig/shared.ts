import {
  ALPH_TOKEN_ID,
  DUST_AMOUNT,
  ExplorerProvider,
  FungibleTokenMetaData,
  NodeProvider,
  SignerProvider,
  binToHex,
  bs58,
  convertAlphAmountWithDecimals,
  convertAmountWithDecimals,
  encodeI256,
  hexToBinUnsafe,
  isHexString,
  node,
  prettifyAttoAlphAmount,
  prettifyTokenAmount,
  verifySignature,
} from '@alephium/web3'
import blake from 'blakejs'
import { useEffect, useState } from 'react'
import { useAlephium } from '../../utils/utils'
import { TokenInfo } from '@alephium/token-list'

export const newMultisigStorageKey = 'multisig-wip'
export const allMultisigStorageKey = 'multisig-all'
export const newMultisigTxStorageKey = 'multisig-tx-wip'
export const defaultNewMultisig = {
  name: '',
  pubkeys: [{ name: '', pubkey: '' }],
  mOfN: 1,
}
export const defaultNewMultisigTx = {
  multisig: '',
  signers: [] as string[],
  destinations: [
    {
      address: '',
      symbol: '',
      tokenId: '',
      tokenAmount: undefined as number | undefined,
    },
  ],
  sweep: undefined as boolean | undefined,
  unsignedTx: undefined as string | undefined,
  signatures: [] as { name: string; signature: string }[],
  step: 0,
}
export type MultisigConfig = typeof defaultNewMultisig
export type AllMultisig = (MultisigConfig & { address: string })[]

export function resetNewMultisig() {
  window.localStorage.setItem(
    newMultisigStorageKey,
    JSON.stringify(defaultNewMultisig)
  )
}

export function resetNewMultisigTx() {
  window.localStorage.setItem(
    newMultisigTxStorageKey,
    JSON.stringify(defaultNewMultisigTx)
  )
}

export function getAllMultisigConfig(): AllMultisig {
  const allMultisigRaw = window.localStorage.getItem(allMultisigStorageKey)
  return (allMultisigRaw ? JSON.parse(allMultisigRaw) : []) as AllMultisig
}

export function addMultisigConfig(
  config: MultisigConfig & { address: string }
) {
  const allMultisigs = getAllMultisigConfig()
  window.localStorage.setItem(
    allMultisigStorageKey,
    JSON.stringify([...allMultisigs, config])
  )
}

export function removeMultisigConfig(name: string) {
  const allMultisigs = getAllMultisigConfig()
  window.localStorage.setItem(
    allMultisigStorageKey,
    JSON.stringify(allMultisigs.filter((c) => c.name !== name))
  )
}

export function isMultisigExists(name: string): boolean {
  const allMultisigConfigs = getAllMultisigConfig()
  return allMultisigConfigs.find((config) => config.name === name) !== undefined
}

export function isPubkeyValid(pubkey: string): boolean {
  return isHexString(pubkey) && pubkey.length === 66
}

export function isSignatureValid(signature: string): boolean {
  return isHexString(signature) && signature.length === 128
}

export function buildMultisigAddress(config: MultisigConfig): string {
  const pubkeyHashes = config.pubkeys.map((pubkey) => {
    const bytes = hexToBinUnsafe(pubkey.pubkey)
    return blake.blake2b(bytes, undefined, 32)
  })
  const pubkeyLength = config.pubkeys.length
  const bytesArray = [Uint8Array.from([1]), encodeI256(BigInt(pubkeyLength))]
    .concat(pubkeyHashes)
    .concat([encodeI256(BigInt(config.mOfN))])
  const encoded = Uint8Array.from(
    bytesArray.reduce(
      (acc, cur) => Uint8Array.from([...acc, ...cur]),
      new Uint8Array()
    )
  )
  return bs58.encode(encoded)
}

export function useAllMultisig(): AllMultisig {
  return getAllMultisigConfig()
}

function tryGetMultisig(configName: string) {
  const config = getAllMultisigConfig().find((c) => c.name === configName)
  if (config === undefined) {
    throw new Error(`The multisig ${configName} does not exist`)
  }
  return config
}

export function useBalance(address: string | undefined) {
  const alephium = useAlephium()
  const [balance, setBalance] = useState<node.Balance>()
  useEffect(() => {
    if (address === undefined) return

    alephium.addresses
      .getAddressesAddressBalance(address)
      .then(setBalance)
      .catch((error) => {
        console.error(`Get balance error: ${error}`)
      })
  }, [address])
  return balance
}

export function showTokenBalance(
  balance: node.Balance | undefined,
  tokenInfo: TokenInfo | undefined
) {
  if (balance === undefined || tokenInfo === undefined) return ''
  const tokenAmount =
    tokenInfo.id === ALPH_TOKEN_ID
      ? balance.balance
      : balance.tokenBalances?.find((t) => t.id === tokenInfo.id)?.amount
  if (tokenAmount === undefined) return ''
  return prettifyTokenAmount(tokenAmount, tokenInfo.decimals)
}

export function isTokenIdValid(tokenId: string) {
  return tokenId.length === 64 && isHexString(tokenId)
}

export function toUtf8String(str: string) {
  const decoder = new TextDecoder('utf-8')
  return decoder.decode(hexToBinUnsafe(str))
}

async function checkBalances(
  nodeProvider: NodeProvider,
  address: string,
  tokenBalances: Map<string, bigint>,
  tokenInfos: TokenInfo[]
) {
  const balances = await nodeProvider.addresses.getAddressesAddressBalance(
    address
  )
  tokenBalances.forEach((amount, id) => {
    const locked =
      id === ALPH_TOKEN_ID
        ? balances.lockedBalance
        : balances.lockedTokenBalances?.find((t) => t.id === id)?.amount ?? 0n
    const total =
      id === ALPH_TOKEN_ID
        ? balances.balance
        : balances.tokenBalances?.find((t) => t.id === id)?.amount ?? 0n
    const available = BigInt(total) - BigInt(locked)
    const tokenInfo = tokenInfos.find((t) => t.id === id)!
    if (available < amount) {
      const expected = prettifyTokenAmount(amount, tokenInfo.decimals)
      const got = prettifyTokenAmount(available, tokenInfo.decimals)
      throw new Error(
        `Not enough balance, expect ${expected} ${tokenInfo.symbol}, got ${got} ${tokenInfo.symbol}`
      )
    }
  })
}

export async function buildMultisigTx(
  nodeProvider: NodeProvider,
  configName: string,
  signerNames: string[],
  destinations: (typeof defaultNewMultisigTx)['destinations'],
  tokenInfos: TokenInfo[]
) {
  const config = tryGetMultisig(configName)
  if (signerNames.length !== config.mOfN) {
    throw new Error(`Please select ${config.mOfN} signers`)
  }
  const signerPublicKeys = signerNames.map(
    (name) => config.pubkeys.find((p) => p.name === name)!.pubkey
  )
  const tokenBalances = new Map<string, bigint>()
  const transferDestinations = destinations.map((d) => {
    if (d.tokenId === '' || d.tokenAmount === undefined) {
      throw new Error('Please input the amount')
    }
    const tokenInfo = tokenInfos.find((t) => t.id === d.tokenId)!
    const tokenAmount = convertAmountWithDecimals(
      d.tokenAmount,
      tokenInfo.decimals
    )!
    const tokenBalance = tokenBalances.get(d.tokenId)
    if (tokenBalance === undefined) tokenBalances.set(d.tokenId, tokenAmount)
    else tokenBalances.set(d.tokenId, tokenAmount + tokenBalance)

    if (d.tokenId !== ALPH_TOKEN_ID) {
      const alphBalance = tokenBalances.get(ALPH_TOKEN_ID)
      if (alphBalance === undefined)
        tokenBalances.set(ALPH_TOKEN_ID, DUST_AMOUNT)
      else tokenBalances.set(ALPH_TOKEN_ID, alphBalance + DUST_AMOUNT)
      return {
        address: d.address,
        attoAlphAmount: DUST_AMOUNT.toString(),
        tokens: [{ id: d.tokenId, amount: tokenAmount.toString() }],
      }
    } else {
      return { address: d.address, attoAlphAmount: tokenAmount.toString() }
    }
  })
  await checkBalances(nodeProvider, config.address, tokenBalances, tokenInfos)
  return await nodeProvider.multisig.postMultisigBuild({
    fromAddress: config.address,
    fromPublicKeys: signerPublicKeys,
    destinations: transferDestinations,
  })
}

export async function buildMultisigSweepTx(
  nodeProvider: NodeProvider,
  configName: string,
  signerNames: string[],
  destination: string
) {
  const config = tryGetMultisig(configName)
  if (signerNames.length !== config.mOfN) {
    throw new Error(`Please select ${config.mOfN} signers`)
  }
  const signerPublicKeys = signerNames.map(
    (name) => config.pubkeys.find((p) => p.name === name)!.pubkey
  )
  const txResult = await nodeProvider.multisig.postMultisigSweep({
    fromAddress: config.address,
    fromPublicKeys: signerPublicKeys,
    toAddress: destination,
  })
  const unsignedTx = txResult.unsignedTxs[0].unsignedTx
  const decodedTx =
    await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({
      unsignedTx,
    })
  return [unsignedTx, decodedTx] as const
}

export async function signMultisigTx(
  signerProvider: SignerProvider,
  unsignedTx: string
) {
  const account = await signerProvider.getSelectedAccount()
  const { signature } = await signerProvider.signUnsignedTx({
    signerAddress: account.address,
    signerKeyType: account.keyType,
    unsignedTx: unsignedTx,
  })
  return { signer: account.publicKey, signature }
}

export async function submitMultisigTx(
  nodeProvider: NodeProvider,
  configName: string,
  selectedSignerNames: string[],
  unsignedTx: string,
  signatures: { name: string; signature: string }[]
) {
  const config = tryGetMultisig(configName)
  if (signatures.length !== config.mOfN) {
    throw new Error(`Expect ${config.mOfN} signatures`)
  }
  const txId = binToHex(
    blake.blake2b(hexToBinUnsafe(unsignedTx), undefined, 32)
  )
  const signaturesByPublicKey = signatures.map((s) => {
    const pubkey = config.pubkeys.find((p) => p.name === s.name)!.pubkey
    return { name: s.name, pubkey, signature: s.signature }
  })
  const txSignatures = Array<string>(config.pubkeys.length).fill('')
  signaturesByPublicKey.forEach((s) => {
    const index = config.pubkeys.findIndex((p) => p.pubkey === s.pubkey)
    if (index === -1) {
      throw new Error(`Unknown signer: ${s.name}`)
    }
    verifyTxSignature(config, selectedSignerNames, txId, s, s.signature)
    if (txSignatures[index] !== '') {
      throw new Error(`Duplicate signature from signer ${s.name}`)
    }
    txSignatures[index] = s.signature
  })
  return await nodeProvider.multisig.postMultisigSubmit({
    unsignedTx: unsignedTx,
    signatures: txSignatures.filter((s) => s !== ''),
  })
}

function verifyTxSignature(
  multisigConfig: MultisigConfig,
  selectedSignerNames: string[],
  txId: string,
  expectedSigner: { name: string; pubkey: string },
  signature: string
) {
  if (verifySignature(txId, expectedSigner.pubkey, signature)) {
    return
  }

  const selectedSigners = selectedSignerNames.map(
    (name) => multisigConfig.pubkeys.find((s) => s.name === name)!
  )
  selectedSigners.forEach((signer) => {
    if (signer.pubkey === expectedSigner.pubkey) return // we have checked this one
    if (verifySignature(txId, signer.pubkey, signature)) {
      throw new Error(
        `The signature ${shortSignature(signature)} is from ${
          signer.name
        }, not ${expectedSigner.name}`
      )
    }
  })

  throw new Error(`Invalid signature ${shortSignature(signature)}`)
}

function shortSignature(signature: string) {
  return `${signature.slice(0, 6)}...${signature.slice(-6)}`
}

export async function waitTxSubmitted(
  provider: ExplorerProvider,
  txId: string,
  maxTimes: number = 30
): Promise<void> {
  try {
    await provider.transactions.getTransactionsTransactionHash(txId)
    return
  } catch (error) {
    console.error(`Get transaction status error: ${error}`)
    if (maxTimes === 0) {
      throw error
    }
  }
  await new Promise((r) => setTimeout(r, 4000))
  await waitTxSubmitted(provider, txId, maxTimes - 1)
}

export function configToSting(config: MultisigConfig): string {
  const dupConfig = { ...config }
  delete (dupConfig as any)['address']
  const jsonStr = JSON.stringify(dupConfig)
  const hash = binToHex(blake.blake2b(jsonStr, undefined, 32))
  return btoa(jsonStr + hash)
}

export function stringToConfig(rawConfig: string): MultisigConfig {
  const rawStr = atob(rawConfig)
  if (rawStr.length <= 64) {
    throw new Error('Invalid config')
  }
  const hashIndex = rawStr.length - 64
  const hash = rawStr.slice(hashIndex)
  const jsonStr = rawStr.slice(0, hashIndex)
  const expectedHash = binToHex(blake.blake2b(jsonStr, undefined, 32))
  if (hash !== expectedHash) {
    throw new Error('Invalid config hash')
  }
  return validateConfigJson(JSON.parse(jsonStr))
}

function validateConfigJson(config: any): MultisigConfig {
  const name = config['name']
  if (name === undefined || name === '') {
    throw new Error('Invalid config name')
  }
  if (isMultisigExists(name)) {
    throw new Error('The multisig already exists')
  }
  const pubkeys = config['pubkeys']
  if (pubkeys === undefined || !Array.isArray(pubkeys)) {
    throw new Error('Expected a non-empty pubkey array')
  }
  const pubkeyLength = pubkeys.length
  if (pubkeyLength === 0) {
    throw new Error('The pubkey list is empty')
  }
  pubkeys.forEach((pubkeyConfig, idx) => {
    const name = pubkeyConfig['name']
    if (name === undefined || name === '') {
      throw new Error(`Invalid name in the pubkeys list, index: ${idx}`)
    }
    const pubkey = pubkeyConfig['pubkey']
    if (pubkey === undefined || !isPubkeyValid(pubkey)) {
      throw new Error(`Invalid pubkey in the pubkeys list, index: ${idx}`)
    }
  })
  const mOfN = config['mOfN']
  if (mOfN === undefined || typeof mOfN !== 'number') {
    throw new Error('Invalid mOfN')
  }
  if (mOfN < 1 || mOfN > pubkeyLength) {
    throw new Error('Invalid value of mOfN')
  }
  return config as MultisigConfig
}
