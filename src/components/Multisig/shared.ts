export const newMultisigStorageKey = 'multisig-wip'
export const allMultisigStorageKey = 'multisig-all'
export const defaultNewMultisig = {
  name: '',
  pubkeys: [
    { name: '', pubkey: '' },
  ],
  mOfN: 1,
}
export type MutlisigConfig = typeof defaultNewMultisig
export type AllMultisig = (MutlisigConfig & { address: string })[]
