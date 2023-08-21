import { bs58, encodeI256, hexToBinUnsafe, isHexString } from "@alephium/web3"
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
  const data = window.localStorage.getItem(allMultisigStorageKey)
  if (data) {
    return JSON.parse(data) as AllMultisig
  }
  return []
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
