import { Anchor, Box, Button, Group, Mark, Text, Textarea } from '@mantine/core'
import { useCallback, useState } from 'react'
import { useWallet } from '@alephium/web3-react'
import { MultisigConfig, getAllMultisigConfig, signMultisigTx } from './shared'
import { NodeProvider, isHexString } from '@alephium/web3'
import CopyTextarea from '../Misc/CopyTextarea'

type P2MPKUnlockScript = { pubkey: string; index: number }[]

function SignMultisigTx() {
  const [signature, setSignature] = useState<
    { signer: string; signature: string } | undefined
  >()
  const [unsignedTx, setUnsignedTx] = useState<string | undefined>()
  const [loadingConfig, setLoadingConfig] = useState<boolean>(false)
  const [multisigConfig, setMultisigConfig] = useState<
    (MultisigConfig & { address: string }) | undefined
  >()
  const wallet = useWallet()

  const [error, setError] = useState<string>()

  const tryLoadMultisigConfig = useCallback(
    async (unsignedTx: string) => {
      try {
        setLoadingConfig(true)
        if (!isHexString(unsignedTx)) {
          throw new Error('Invalid unsigned tx')
        }

        const nodeProvider =
          wallet?.nodeProvider ?? new NodeProvider('http://127.0.0.1:22973')
        const unlockScript = await getUnlockScript(nodeProvider, unsignedTx)
        const multisigConfig = getMultisigByUnlockScript(unlockScript)
        setMultisigConfig(multisigConfig)
        setLoadingConfig(false)
        setError(undefined)
      } catch (error) {
        setLoadingConfig(false)
        setError(`Error: ${error}`)
        console.error(error)
      }
    },
    [wallet, setMultisigConfig, setLoadingConfig]
  )

  const sign = useCallback(async () => {
    try {
      if (unsignedTx === undefined || !isHexString(unsignedTx)) {
        throw new Error('Invalid unsigned tx')
      }
      if (wallet === undefined) throw new Error('Wallet is not connected')

      const signature = await signMultisigTx(wallet.signer, unsignedTx)
      setSignature(signature)
    } catch (error) {
      setError(`Error: ${error}`)
      console.error(error)
    }
  }, [wallet, unsignedTx, setSignature])

  const reset = useCallback(() => {
    setLoadingConfig(false)
    setSignature(undefined)
    setMultisigConfig(undefined)
  }, [setLoadingConfig, setSignature, setMultisigConfig])

  return (
    <Box maw={900} mx="auto" mt="xl">
      <Text ta="left" fw="700">
        Multisig Transaction
      </Text>
      <Textarea
        placeholder="Paste your multisig transaction here"
        minRows={8}
        mt="md"
        onChange={(e) => {
          reset()
          if (e.target.value === '') {
            setUnsignedTx(undefined)
          } else {
            setUnsignedTx(e.target.value)
            tryLoadMultisigConfig(e.target.value)
          }
        }}
      />
      {error ? (
        <Text color="red" mt="md" mx="lg" ta="left">
          {error}
        </Text>
      ) : loadingConfig || !unsignedTx ? null : (
        <Text ta="left" fw="700" mt="lg">
          The multisig address to sign is{' '}
          {multisigConfig ? (
            <Anchor
              href={`/multisig/show?name=${multisigConfig.name}`}
              target="_blank"
            >
              {multisigConfig.name}
            </Anchor>
          ) : (
            <Mark color="red">unknown</Mark>
          )}
        </Text>
      )}

      {signature ? (
        <Box>
          <Text ta="left" fw="700" mt="xl">
            Signature:{' '}
          </Text>
          <Group position="apart">
            <CopyTextarea value={signature.signature} />
          </Group>
        </Box>
      ) : (
        <Group position="right" mt="xl">
          <Button onClick={sign}>Sign MultiSig Transaction</Button>
        </Group>
      )}
    </Box>
  )
}

function getMultisigByUnlockScript(
  unlockScript: P2MPKUnlockScript
): (MultisigConfig & { address: string }) | undefined {
  const maxPubkeyIndex = unlockScript[unlockScript.length - 1].index
  const allConfigs = getAllMultisigConfig()
  return allConfigs.find((config) => {
    if (config.mOfN !== unlockScript.length) return false
    if (config.pubkeys.length < maxPubkeyIndex) return false
    return unlockScript.every(
      ({ pubkey, index }) => config.pubkeys[index].pubkey === pubkey
    )
  })
}

function decodeUnlockScript(rawUnlockScript: string): P2MPKUnlockScript {
  if (!rawUnlockScript.startsWith('01')) {
    throw new Error('Invalid p2mpk unlock script')
  }
  const p2mpkUnlockScript: P2MPKUnlockScript = []
  // it's ok to read one byte because we support a maximum of 16 keys in p2mpk
  const keySize = parseInt(rawUnlockScript.slice(2, 4), 16)
  let currentIndex = 4
  for (let keyIndex = 0; keyIndex < keySize; keyIndex++) {
    const end = currentIndex + 68
    const publicKeyAndIndex = rawUnlockScript.slice(currentIndex, end)
    p2mpkUnlockScript.push({
      pubkey: publicKeyAndIndex.slice(0, 66),
      index: parseInt(publicKeyAndIndex.slice(66), 16),
    })
    currentIndex = end
  }
  if (currentIndex !== rawUnlockScript.length) {
    throw new Error('Invalid p2mpk unlock script')
  }
  return p2mpkUnlockScript
}

async function getUnlockScript(
  nodeProvider: NodeProvider,
  unsignedTx: string
): Promise<P2MPKUnlockScript> {
  const decodedTx =
    await nodeProvider.transactions.postTransactionsDecodeUnsignedTx({
      unsignedTx,
    })
  if (decodedTx.unsignedTx.inputs.length === 0) {
    throw new Error(`Invalid unsigned tx, the input is empty`)
  }
  const unlockScript = decodedTx.unsignedTx.inputs[0].unlockScript
  const fromSameAddress = decodedTx.unsignedTx.inputs
    .slice(1)
    .every((i) => i.unlockScript === unlockScript)
  if (!fromSameAddress) {
    throw new Error(`Invalid unsigned tx, the input from different address`)
  }
  return decodeUnlockScript(unlockScript)
}

export default SignMultisigTx
