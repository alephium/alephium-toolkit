import { useCallback, useEffect, useState } from 'react'
import {
  Stack,
  Title,
  Text,
  TextInput,
  Paper,
  Button,
  Group,
  Badge,
  Alert,
  Loader,
  Box,
} from '@mantine/core'
import { useWallet } from '@alephium/web3-react'
import {
  isValidAddress,
  prettifyAttoAlphAmount,
  prettifyTokenAmount,
  groupOfAddress,
} from '@alephium/web3'
import { notifications } from '@mantine/notifications'
import {
  IconCheck,
  IconX,
  IconRefresh,
  IconInfoCircle,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { useAlephium, useExplorer, useExplorerFE, useTokenList } from '../../utils/utils'
import { NoWalletAlert } from '../NoWalletAlert'
import { waitTxSubmitted } from '../Multisig/shared'

interface TokenBalance {
  id: string
  symbol: string
  amount: string
}

function ConsolidateUTXOs() {
  const { account, signer } = useWallet()
  const nodeProvider = useAlephium()
  const explorerUrl = useExplorerFE()
  const explorerProvider = useExplorer()
  const tokenList = useTokenList()

  const [utxoCount, setUtxoCount] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
  const [toAddress, setToAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [fetching, setFetching] = useState(false)

  const fetchUTXOInfo = useCallback(async () => {
    if (!account?.address) return

    setFetching(true)

    try {
      const balanceResult = await nodeProvider.addresses.getAddressesAddressBalance(account.address)
      setUtxoCount(balanceResult.utxoNum)

      const totalBalance = BigInt(balanceResult.balance)
      const lockedBalance = BigInt(balanceResult.lockedBalance)
      const available = totalBalance - lockedBalance
      setBalance(prettifyAttoAlphAmount(available.toString()) ?? '0')

      const tokens: TokenBalance[] = (balanceResult.tokenBalances ?? []).map(
        (t) => {
          const meta = tokenList.find((tl) => tl.id === t.id)
          return {
            id: t.id,
            symbol: meta?.symbol ?? `${t.id.slice(0, 8)}...`,
            amount:
              prettifyTokenAmount(t.amount, meta?.decimals ?? 0) ?? t.amount,
          }
        }
      )
      setTokenBalances(tokens)
    } catch (e) {
      console.error('Failed to fetch UTXO info:', e)
      setUtxoCount(null)
      setBalance(null)
      setTokenBalances([])
    } finally {
      setFetching(false)
    }
  }, [account?.address, nodeProvider, tokenList])

  useEffect(() => {
    if (account?.address) {
      setToAddress(account.address)
      void fetchUTXOInfo()
    } else {
      setToAddress('')
      setUtxoCount(null)
      setBalance(null)
      setTokenBalances([])
    }
  }, [account?.address, fetchUTXOInfo])

  const trimmedAddress = toAddress.trim()
  const isDestinationDifferent =
    trimmedAddress !== '' && account?.address !== trimmedAddress

  const addressError = (() => {
    if (!trimmedAddress) return undefined
    if (!isValidAddress(trimmedAddress)) return 'Invalid Alephium address'
    if (
      account?.address &&
      isDestinationDifferent &&
      groupOfAddress(trimmedAddress) !== groupOfAddress(account.address)
    ) {
      return `Destination must be in the same group as your address (group ${groupOfAddress(account.address)})`
    }
    return undefined
  })()

  const hasTokens = tokenBalances.length > 0
  const minUtxos = tokenBalances.length + 1
  const needsConsolidation = utxoCount !== null && utxoCount > minUtxos

  const handleConsolidate = async () => {
    if (!signer || !account || !trimmedAddress || addressError) return
    setLoading(true)
    const txIds: string[] = []
    try {
      const sweepResult =
        await nodeProvider.transactions.postTransactionsSweepAddressBuild({
          fromPublicKey: account.publicKey,
          toAddress: trimmedAddress,
        })

      if (sweepResult.unsignedTxs.length === 0) {
        notifications.show({
          title: 'Nothing to consolidate',
          message: 'No UTXOs need consolidation.',
          icon: <IconInfoCircle size="1.1rem" />,
          color: 'blue',
        })
        void fetchUTXOInfo()
        return
      }

      for (const tx of sweepResult.unsignedTxs) {
        const result = await signer.signAndSubmitUnsignedTx({
          signerAddress: account.address,
          unsignedTx: tx.unsignedTx,
        })
        txIds.push(result.txId)
      }

      setLoading(false)
      setProcessing(true)

      notifications.show({
        title: 'Transactions submitted',
        message: `${txIds.length} transaction${txIds.length > 1 ? 's' : ''} submitted. Waiting for confirmation...`,
        icon: <IconInfoCircle size="1.1rem" />,
        color: 'blue',
      })

      await Promise.all(
        txIds.map((txId) => waitTxSubmitted(explorerProvider, txId))
      )

      notifications.show({
        title: 'UTXOs consolidated successfully!',
        message: (
          <span>
            {txIds.length} transaction{txIds.length > 1 ? 's' : ''} confirmed.{' '}
            {txIds.map((txId, i) => (
              <span key={txId}>
                <a
                  href={`${explorerUrl}/transactions/${txId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Tx {i + 1}
                </a>
                {i < txIds.length - 1 ? ', ' : ''}
              </span>
            ))}
          </span>
        ),
        icon: <IconCheck size="1.1rem" />,
        color: 'teal',
        autoClose: 10000,
      })

      void fetchUTXOInfo()
    } catch (e) {
      console.error('Consolidation failed:', e)
      const errorMsg = e instanceof Error ? e.message : 'Unknown error'
      notifications.show({
        title:
          txIds.length > 0
            ? 'Consolidation partially failed'
            : 'Consolidation failed',
        message:
          txIds.length > 0
            ? `${txIds.length} transaction(s) submitted before failure. Error: ${errorMsg}`
            : `Error: ${errorMsg}`,
        icon: <IconX size="1.1rem" />,
        color: 'red',
      })
    } finally {
      setLoading(false)
      setProcessing(false)
    }
  }

  return (
    <Stack align="center" mt="xl" w="100%" maw={700} mx="auto" p="md">
      <Title order={2}>Consolidate UTXOs</Title>
      <Text c="dimmed">
        Merge multiple UTXOs into one to avoid transaction failures caused by too
        many inputs
      </Text>

      <Stack spacing="xl" w="100%" mt="md">
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Box ta="left" w="100%">
              {!signer && <NoWalletAlert />}
            </Box>

            {account && (
              <>
                <Title order={4}>Current UTXO Status</Title>
                {fetching ? (
                  <Group>
                    <Loader size="sm" />
                    <Text size="sm">Loading UTXO info...</Text>
                  </Group>
                ) : utxoCount !== null ? (
                  <Stack spacing="xs">
                    <Group spacing="md">
                      <Badge size="lg" variant="outline">
                        {utxoCount} UTXO{utxoCount !== 1 ? 's' : ''}
                      </Badge>
                      <Badge size="lg" variant="outline" color="green">
                        {balance} ALPH available
                      </Badge>
                      <Button
                        variant="subtle"
                        size="xs"
                        leftIcon={<IconRefresh size={14} />}
                        onClick={() => void fetchUTXOInfo()}
                      >
                        Refresh
                      </Button>
                    </Group>
                    {hasTokens && (
                      <Group spacing="xs">
                        <Text size="sm" fw="bold">
                          Tokens:
                        </Text>
                        {tokenBalances.map((t) => (
                          <Badge
                            key={t.id}
                            size="md"
                            variant="outline"
                            color="violet"
                          >
                            {t.amount} {t.symbol}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    Could not fetch UTXO information
                  </Text>
                )}

                {utxoCount !== null && !needsConsolidation && (
                  <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                    Your address has {utxoCount} UTXO{utxoCount !== 1 ? 's' : ''}
                    {hasTokens ? ` (${tokenBalances.length} for tokens)` : ''}.
                    No consolidation needed.
                  </Alert>
                )}
              </>
            )}

            <TextInput
              label="Destination Address"
              description="Address where consolidated funds will be sent (defaults to your connected address)"
              placeholder="Enter destination address"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              error={addressError}
              disabled={!signer}
            />

            {isDestinationDifferent && !addressError && hasTokens && (
              <Alert
                color="yellow"
                icon={<IconAlertTriangle size={16} />}
              >
                All funds including tokens will be sent to the destination
                address. Make sure it is correct.
              </Alert>
            )}

            {isDestinationDifferent && !addressError && !hasTokens && (
              <Alert
                color="yellow"
                icon={<IconAlertTriangle size={16} />}
              >
                All funds will be sent to the destination address. Make sure
                it is correct.
              </Alert>
            )}

            {!isDestinationDifferent && hasTokens && needsConsolidation && (
              <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                This will also consolidate your {tokenBalances.length} token
                {tokenBalances.length > 1 ? 's' : ''}.
              </Alert>
            )}

            <Group position="right">
              <Button
                onClick={handleConsolidate}
                loading={loading || processing}
                disabled={
                  !signer ||
                  !trimmedAddress ||
                  !!addressError ||
                  !needsConsolidation ||
                  processing
                }
              >
                {processing ? 'Processing...' : 'Consolidate UTXOs'}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default ConsolidateUTXOs
