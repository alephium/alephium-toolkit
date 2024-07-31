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
  prettifyTokenAmount,
} from '@alephium/web3'
import CopyTextarea from '../Misc/CopyTextarea'
import { useAlephium, useTokenList } from '../../utils/utils'
import MyTable from '../Misc/MyTable'
import { TokenInfo } from '@alephium/token-list'

type P2MPKUnlockScript = { pubkey: string; index: number }[]
type TxInfo = { recipient: string; tokens: {symbol: string, amount: string}[]; fee: string; txId: string }

function SignMultisigTx() {
  const [signature, setSignature] = useState<
    { signer: string; signature: string } | undefined
  >()
  const tokens = useTokenList()
  const [unsignedTx, setUnsignedTx] = useState<string | undefined>()
  const [loadingTxInfo, setLoadingTxInfo] = useState<boolean>(false)
  const [multisigConfig, setMultisigConfig] = useState<
    (MultisigConfig & { address: string }) | undefined
  >()
  const [unlockScript, setUnlockScript] = useState<
    P2MPKUnlockScript | undefined
  >()
  const [txInfo, setTxInfo] = useState<TxInfo>()
  const { account, signer, connectionStatus } = useWallet()

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
        const multisigConfig = getMultisigByUnlockScript(unlockScript)
        setUnlockScript(unlockScript)
        setMultisigConfig(multisigConfig)
        setTxInfo(getDecodedTxInfo(decodedTx, tokens))
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
  }, [account])

  const sign = useCallback(async () => {
    try {
      if (unsignedTx === undefined || !isHexString(unsignedTx)) {
        throw new Error('Invalid unsigned tx')
      }
      if (connectionStatus !== 'connected')
        throw new Error('Wallet is not connected')

      if (
        unlockScript !== undefined &&
        unlockScript.find((p) => p.pubkey === account.publicKey) === undefined
      ) {
        throw new Error(
          'The currently connected account is not the expected signer'
        )
      }

      const signature = await signMultisigTx(signer, unsignedTx)
      setSignature(signature)
    } catch (error) {
      setSigningError(`Error: ${error}`)
      console.error(error)
    }
  }, [
    unsignedTx,
    setSignature,
    unlockScript,
    signer,
    account,
    connectionStatus,
  ])

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
        value={unsignedTx ?? ''}
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
              'Token Amount': txInfo?.tokens.map(({ symbol, amount }) => (
                <Box key={symbol}>
                  {amount} {symbol}
                </Box>
              )),
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
        <Group position="apart" mt="xl" mx="md">
          <Button
            disabled={loadingTxInfo || !!loadingTxError || !unsignedTx}
            onClick={() => setUnsignedTx(undefined)}
          >
            Reset
          </Button>
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
    .every((i) => i.unlockScript === unlockScript || i.unlockScript === '03') // '03' is SameAsPrevious
  if (!fromSameAddress) {
    throw new Error(`Invalid unsigned tx, the input from different address`)
  }
  return decodedTx
}

function getDecodedTxInfo(
  decodedTx: node.DecodeUnsignedTxResult,
  tokens: TokenInfo[]
): TxInfo {
  const recipientOutput = decodedTx.unsignedTx.fixedOutputs[0]
  return {
    recipient: recipientOutput.address,
    tokens: [
      {
        symbol: 'ALPH',
        amount: prettifyAttoAlphAmount(BigInt(recipientOutput.attoAlphAmount))!,
      },
      ...recipientOutput.tokens.map((token) => {
        const tokenInfo = tokens.find((t) => t.id === token.id)
        return {
          symbol: tokenInfo?.symbol ?? token.id,
          amount:
            prettifyTokenAmount(token.amount, tokenInfo?.decimals ?? 0) ??
            '???',
        }
      }),
    ],
    fee: prettifyAttoAlphAmount(
      BigInt(decodedTx.unsignedTx.gasPrice) *
        BigInt(decodedTx.unsignedTx.gasAmount)
    )!,
    txId: decodedTx.unsignedTx.txId,
  }
}

export default SignMultisigTx
