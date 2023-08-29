import {
  Anchor,
  Box,
  Button,
  Group,
  Input,
  Mark,
  Text,
  Textarea,
} from '@mantine/core'
import { useCallback, useEffect, useState } from 'react'
import { useWallet } from '@alephium/web3-react'
import { MultisigConfig, getAllMultisigConfig, signMultisigTx } from './shared'
import {
  NodeProvider,
  isHexString,
  node,
  prettifyAttoAlphAmount,
} from '@alephium/web3'
import CopyTextarea from '../Misc/CopyTextarea'
import { useAlephium } from '../../utils/utils'
import MyTable from '../Misc/MyTable'

type P2MPKUnlockScript = { pubkey: string; index: number }[]

function SignMultisigTx() {
  const [signature, setSignature] = useState<
    { signer: string; signature: string } | undefined
  >()
  const [unsignedTx, setUnsignedTx] = useState<string | undefined>()
  const [loadingTxInfo, setLoadingTxInfo] = useState<boolean>(false)
  const [multisigConfig, setMultisigConfig] = useState<
    (MultisigConfig & { address: string }) | undefined
  >()
  const [unlockScript, setUnlockScript] = useState<
    P2MPKUnlockScript | undefined
  >()
  const [txInfo, setTxInfo] = useState<
    { recipient: string; amount: string; fee: string; txId: string } | undefined
  >()
  const wallet = useWallet()

  const [loadingTxError, setLoadingTxError] = useState<string>()

  const nodeProvider = useAlephium()

  const tryLoadMultisigTxInfo = useCallback(
    async (unsignedTx: string) => {
      try {
        setLoadingTxInfo(true)
        if (!isHexString(unsignedTx)) {
          throw new Error('Invalid unsigned tx')
        }

        const decodedTx = await getDecodedUnsignedTx(nodeProvider, unsignedTx)
        const unlockScript = decodeUnlockScript(
          decodedTx.unsignedTx.inputs[0].unlockScript
        )
        const recipientOutput = decodedTx.unsignedTx.fixedOutputs[0]
        const multisigConfig = getMultisigByUnlockScript(unlockScript)
        setUnlockScript(unlockScript)
        setMultisigConfig(multisigConfig)
        setTxInfo({
          recipient: recipientOutput.address,
          amount: prettifyAttoAlphAmount(
            BigInt(recipientOutput.attoAlphAmount)
          )!,
          fee: prettifyAttoAlphAmount(
            BigInt(decodedTx.unsignedTx.gasPrice) *
              BigInt(decodedTx.unsignedTx.gasAmount)
          )!,
          txId: decodedTx.unsignedTx.txId,
        })
        setLoadingTxInfo(false)
        setLoadingTxError(undefined)
      } catch (error) {
        setLoadingTxInfo(false)
        setLoadingTxError(`Error: ${error}`)
        console.error(error)
      }
    },
    [setMultisigConfig, setLoadingTxInfo]
  )

  const [signingError, setSigningError] = useState<string | undefined>()
  useEffect(() => {
    // clear the error when switching accounts
    setSigningError(undefined)
  }, [wallet])

  const sign = useCallback(async () => {
    try {
      if (unsignedTx === undefined || !isHexString(unsignedTx)) {
        throw new Error('Invalid unsigned tx')
      }
      if (wallet === undefined) throw new Error('Wallet is not connected')

      if (
        unlockScript !== undefined &&
        unlockScript.find((p) => p.pubkey === wallet.account.publicKey) ===
          undefined
      ) {
        throw new Error(
          'The currently connected account is not the expected signer'
        )
      }

      const signature = await signMultisigTx(wallet.signer, unsignedTx)
      setSignature(signature)
    } catch (error) {
      setSigningError(`Error: ${error}`)
      console.error(error)
    }
  }, [wallet, unsignedTx, setSignature, unlockScript])

  const reset = useCallback(() => {
    setLoadingTxInfo(false)
    setSignature(undefined)
    setMultisigConfig(undefined)
    setTxInfo(undefined)
    setLoadingTxError(undefined)
    setSigningError(undefined)
    setUnlockScript(undefined)
  }, [setLoadingTxInfo, setSignature, setMultisigConfig])

  return (
    <Box maw={900} mx="auto" mt="5rem">
      <Text ta="left" fw="700" size="xl">
        Transaction to sign
      </Text>
      <Input.Description ta="left" size="md">
        The transaction must be created by the multisig address.
      </Input.Description>
      <Textarea
        placeholder="Paste your multisig transaction here"
        minRows={6}
        mt="md"
        onChange={(e) => {
          reset()
          if (e.target.value === '') {
            setUnsignedTx(undefined)
          } else {
            setUnsignedTx(e.target.value)
            tryLoadMultisigTxInfo(e.target.value)
          }
        }}
        styles={{
          input: {
            color: 'gray',
            opacity: 0.9,
          },
        }}
      />
      {loadingTxError ? (
        <Text color="red" mt="md" mx="lg" ta="left">
          {loadingTxError}
        </Text>
      ) : loadingTxInfo || !unsignedTx ? null : (
        <Box mt="xl">
          <Text ta="left" fw="700" mb="lg">
            Transaction Details
          </Text>
          <MyTable
            px={0}
            py={0}
            verticalSpacing={'sm'}
            data={{
              Multisig: multisigConfig ? (
                <Anchor
                  href={`/alephium-toolkit/#/multisig/show?name=${multisigConfig.name}`}
                  target="_blank"
                >
                  {multisigConfig.name}
                </Anchor>
              ) : (
                <Mark color="red">unknown</Mark>
              ),
              Recipient: <CopyTextarea value={txInfo?.recipient ?? ''} />,
              'ALPH Amount': txInfo?.amount + ' ALPH',
              'Transaction Fee': txInfo?.fee + ' ALPH',
              'Transaction Hash': <CopyTextarea value={txInfo?.txId ?? ''} />,
            }}
          />
        </Box>
      )}

      {signingError && (
        <Text color="red" mt="md" mx="lg" ta="left">
          {signingError}
        </Text>
      )}

      {signature ? (
        <Box>
          <Text ta="left" fw="700" mt="xl">
            Copy and share the signature:
          </Text>
          <Group position="apart" mt="md">
            <CopyTextarea value={signature.signature} />
          </Group>
        </Box>
      ) : (
        <Group position="right" mt="xl" mx="md">
          <Button
            disabled={loadingTxInfo || !!loadingTxError || !unsignedTx}
            onClick={sign}
          >
            Sign Transaction
          </Button>
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

async function getDecodedUnsignedTx(
  nodeProvider: NodeProvider,
  unsignedTx: string
): Promise<node.DecodeUnsignedTxResult> {
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
  return decodedTx
}

export default SignMultisigTx
