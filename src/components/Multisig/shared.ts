import { NodeProvider, SignerProvider, binToHex, bs58, convertAlphAmountWithDecimals, encodeI256, hexToBinUnsafe, isHexString, verifySignature } from "@alephium/web3"
import blake from 'blakejs'

export const newMultisigStorageKey = 'multisig-wip'
export const allMultisigStorageKey = 'multisig-all'
export const defaultNewMultisig = {
  name: '',
  pubkeys: [
    { name: '', pubkey: '' },
  ],
  mOfN: 1,
}
export type MultisigConfig = typeof defaultNewMultisig
export type AllMultisig = (MultisigConfig & { address: string })[]

export function getAllMultisigConfig(): AllMultisig {
  const allMultisigRaw = window.localStorage.getItem(allMultisigStorageKey)
  return (allMultisigRaw ? JSON.parse(allMultisigRaw) : []) as AllMultisig
}

export function addMultisigConfig(config: MultisigConfig & { address: string }) {
  const allMultisigs = getAllMultisigConfig()
  window.localStorage.setItem(allMultisigStorageKey, JSON.stringify([...allMultisigs, config]))
}

export function isMultisigExists(name: string): boolean {
  const allMultisigConfigs = getAllMultisigConfig()
  return allMultisigConfigs.find((config) => config.name === name) !== undefined
}

export function isPubkeyValid(pubkey: string): boolean {
  return isHexString(pubkey) && pubkey.length === 66
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
  const encoded = Uint8Array.from(bytesArray.reduce((acc, cur) => Uint8Array.from([...acc, ...cur]), new Uint8Array()))
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

export async function buildMultisigTx(
  nodeProvider: NodeProvider,
  configName: string,
  signers: string[],
  destinations: { address: string, alphAmount: string }[]
) {
  const config = tryGetMultisig(configName)
  if (signers.length !== config.mOfN) {
    throw new Error(`Expect ${config.mOfN} signers`)
  }
  signers.sort((a, b) => config.pubkeys.findIndex((p) => p.pubkey === a) - config.pubkeys.findIndex((p) => p.pubkey === b))
  return await nodeProvider.multisig.postMultisigBuild({
    fromAddress: config.address,
    fromPublicKeys: signers,
    destinations: destinations.map((d) =>
      ({
        address: d.address,
        attoAlphAmount: convertAlphAmountWithDecimals(d.alphAmount)!.toString()
      })
    )
  })
}

export async function signMultisigTx(signerProvider: SignerProvider, unsignedTx: string) {
  const account = await signerProvider.getSelectedAccount()
  const { signature } = await signerProvider.signUnsignedTx({
    signerAddress: account.address,
    signerKeyType: account.keyType,
    unsignedTx: unsignedTx
  })
  return { signer: account.publicKey, signature }
}

export async function submitMultisigTx(
  nodeProvider: NodeProvider,
  configName: string,
  unsignedTx: string,
  signatures: { signer: string, signature: string }[]
) {
  const config = tryGetMultisig(configName)
  if (signatures.length !== config.mOfN) {
    throw new Error(`Expect ${config.mOfN} signatures`)
  }
  const txId = binToHex(blake.blake2b(hexToBinUnsafe(unsignedTx), undefined, 32))
  const txSignatures = Array(config.pubkeys.length).fill('')
  signatures.forEach((s) => {
    const index = config.pubkeys.findIndex((p) => p.pubkey === s.signer)
    if (index === -1) {
      throw new Error(`Unknown signer: ${s.signer}`)
    }
    if (!verifySignature(txId, s.signer, s.signature)) {
      throw new Error(`Invalid signature from signer ${s.signer}`)
    }
    if (txSignatures[index] !== '') {
      throw new Error(`Duplicate signature from signer ${s.signer}`)
    }
    txSignatures[index] = s.signature
  })
  return await nodeProvider.multisig.postMultisigSubmit({
    unsignedTx: unsignedTx,
    signatures: txSignatures.filter((s) => s !== '')
  })
}

export function configToSting(config: MultisigConfig): string {
  const dupConfig = { ...config }
  delete((dupConfig as any)['address'])
  const jsonStr = JSON.stringify(dupConfig)
  const hash = binToHex(blake.blake2b(jsonStr, undefined, 32))
  return btoa(jsonStr) + hash
}

export function stringToConfig(rawConfig: string): MultisigConfig {
  if (rawConfig.length <= 64) {
    throw new Error('Invalid config length')
  }
  const hashIndex = rawConfig.length - 64
  const hash = rawConfig.slice(hashIndex)
  const jsonStr = atob(rawConfig.slice(0, hashIndex))
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
