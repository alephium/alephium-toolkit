import { useState } from 'react'
import {
  Stack,
  Title,
  Text,
  TextInput,
  Paper,
  Group,
  NumberInput,
} from '@mantine/core'
import {
  convertAlphAmountWithDecimals,
  prettifyAttoAlphAmount,
  prettifyTokenAmount,
  number256ToNumber,
  convertAmountWithDecimals,
} from '@alephium/web3'
import { IconArrowRight } from '@tabler/icons-react'
import CopyTextarea from '../Misc/CopyTextarea'

function ResultRow({ label, value }: { label: string; value: string | number | undefined }) {
  if (value === undefined || value === '') return null
  return (
    <Group position="apart" w="100%">
      <Text fw="bold" size="sm">{label}:</Text>
      <CopyTextarea value={String(value)} />
    </Group>
  )
}

function AmountUtils() {
  const [alphAmount, setAlphAmount] = useState<number | ''>('')
  const [attoAmount, setAttoAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [tokenDecimals, setTokenDecimals] = useState<number | ''>(18)
  const [bigintInput, setBigintInput] = useState('')
  const [bigintDecimals, setBigintDecimals] = useState<number | ''>(18)

  const alphToAtto = () => {
    if (alphAmount === '') return null
    try {
      const result = convertAlphAmountWithDecimals(alphAmount)
      return result?.toString()
    } catch {
      return null
    }
  }

  const attoToAlph = () => {
    if (!attoAmount) return null
    try {
      return prettifyAttoAlphAmount(BigInt(attoAmount))
    } catch {
      return null
    }
  }

  const tokenToAtto = () => {
    if (!tokenAmount || tokenDecimals === '') return null
    try {
      const result = convertAmountWithDecimals(tokenAmount, tokenDecimals)
      return result?.toString()
    } catch {
      return null
    }
  }

  const prettifyToken = () => {
    if (!tokenAmount || tokenDecimals === '') return null
    try {
      const attoValue = convertAmountWithDecimals(tokenAmount, tokenDecimals)
      if (!attoValue) return null
      return prettifyTokenAmount(attoValue, tokenDecimals)
    } catch {
      return null
    }
  }

  const bigintToNumber = () => {
    if (!bigintInput || bigintDecimals === '') return null
    try {
      return number256ToNumber(BigInt(bigintInput), bigintDecimals)
    } catch {
      return null
    }
  }

  return (
    <Stack align="center" mt="xl" w="100%" maw={900} mx="auto" p="md">
      <Title order={2}>Amount Utilities</Title>
      <Text c="dimmed">Tools for converting token amounts</Text>

      <Stack spacing="xl" w="100%" mt="md">
        {/* ALPH Conversion */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>ALPH <IconArrowRight size={16} style={{ display: 'inline' }} /> Atto-ALPH</Title>
            <Text size="sm" c="dimmed">Convert human-readable ALPH to atto-ALPH (smallest unit)</Text>
            <NumberInput
              label="ALPH Amount"
              placeholder="e.g., 1.23"
              value={alphAmount}
              onChange={setAlphAmount}
              precision={18}
              min={0}
            />
            {alphToAtto() && (
              <ResultRow label="Atto-ALPH" value={alphToAtto()!} />
            )}
          </Stack>
        </Paper>

        {/* Atto to ALPH */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Atto-ALPH <IconArrowRight size={16} style={{ display: 'inline' }} /> ALPH</Title>
            <Text size="sm" c="dimmed">Convert atto-ALPH back to human-readable format</Text>
            <TextInput
              label="Atto-ALPH Amount"
              placeholder="e.g., 1230000000000000000"
              value={attoAmount}
              onChange={(e) => setAttoAmount(e.target.value)}
            />
            {attoToAlph() && (
              <ResultRow label="ALPH" value={attoToAlph()!} />
            )}
          </Stack>
        </Paper>

        {/* Token Amount Conversion */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Token Amount Conversion</Title>
            <Text size="sm" c="dimmed">Convert token amounts with custom decimals</Text>
            <TextInput
              label="Amount"
              placeholder="e.g., 100.5"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
            />
            <NumberInput
              label="Decimals"
              placeholder="18"
              value={tokenDecimals}
              onChange={setTokenDecimals}
              min={0}
              max={18}
            />
            {tokenToAtto() && (
              <Stack spacing="xs">
                <ResultRow label="Raw Amount" value={tokenToAtto()!} />
                {prettifyToken() && <ResultRow label="Prettified" value={prettifyToken()!} />}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* BigInt to Number */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>BigInt <IconArrowRight size={16} style={{ display: 'inline' }} /> Number</Title>
            <Text size="sm" c="dimmed">Convert a raw bigint amount to a decimal number</Text>
            <TextInput
              label="BigInt Value"
              placeholder="e.g., 1230000000000000000"
              value={bigintInput}
              onChange={(e) => setBigintInput(e.target.value)}
            />
            <NumberInput
              label="Decimals"
              placeholder="18"
              value={bigintDecimals}
              onChange={setBigintDecimals}
              min={0}
              max={18}
            />
            {bigintToNumber() !== null && (
              <ResultRow label="Number" value={bigintToNumber()!} />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default AmountUtils
