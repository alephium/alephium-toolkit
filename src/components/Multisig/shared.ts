import { isHexString } from "@alephium/web3"

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
