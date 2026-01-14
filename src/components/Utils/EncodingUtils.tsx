import { useState } from 'react'
import {
  Stack,
  Title,
  Text,
  TextInput,
  Paper,
  Group,
  Badge,
} from '@mantine/core'
import {
  binToHex,
  stringToHex,
  hexToString,
  isHexString,
  isBase58,
  base58ToBytes,
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

function ValidationBadge({ isValid, trueLabel, falseLabel }: { isValid: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <Badge color={isValid ? 'green' : 'red'} size="md">
      {isValid ? trueLabel : falseLabel}
    </Badge>
  )
}

function EncodingUtils() {
  const [hexInput, setHexInput] = useState('')
  const [stringInput, setStringInput] = useState('')
  const [base58Input, setBase58Input] = useState('')
  const [bytesInput, setBytesInput] = useState('')

  const hexToStringResult = () => {
    if (!hexInput) return null
    try {
      if (!isHexString(hexInput)) return { valid: false }
      return { valid: true, result: hexToString(hexInput) }
    } catch {
      return { valid: false }
    }
  }

  const stringToHexResult = () => {
    if (!stringInput) return null
    try {
      return stringToHex(stringInput)
    } catch {
      return null
    }
  }

  const base58Validation = () => {
    if (!base58Input) return null
    try {
      const valid = isBase58(base58Input)
      if (!valid) return { valid: false }
      const bytes = base58ToBytes(base58Input)
      return { valid: true, bytes: binToHex(bytes) }
    } catch {
      return { valid: false }
    }
  }

  const hexResult = hexToStringResult()
  const base58Result = base58Validation()

  return (
    <Stack align="center" mt="xl" w="100%" maw={900} mx="auto" p="md">
      <Title order={2}>Encoding Utilities</Title>
      <Text c="dimmed">Tools for encoding and decoding data</Text>

      <Stack spacing="xl" w="100%" mt="md">
        {/* Hex to String */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Hex <IconArrowRight size={16} style={{ display: 'inline' }} /> String</Title>
            <TextInput
              label="Hex String"
              placeholder="Enter hex string (e.g., 48656c6c6f)"
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              rightSection={hexInput && (
                <Badge color={isHexString(hexInput) ? 'green' : 'red'} size="sm" mr="xs">
                  {isHexString(hexInput) ? 'Valid Hex' : 'Invalid Hex'}
                </Badge>
              )}
              rightSectionWidth={100}
            />
            {hexResult?.valid && (
              <ResultRow label="Decoded String" value={hexResult.result} />
            )}
          </Stack>
        </Paper>

        {/* String to Hex */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>String <IconArrowRight size={16} style={{ display: 'inline' }} /> Hex</Title>
            <TextInput
              label="String"
              placeholder="Enter any string"
              value={stringInput}
              onChange={(e) => setStringInput(e.target.value)}
            />
            {stringToHexResult() && (
              <ResultRow label="Hex Encoded" value={stringToHexResult()!} />
            )}
          </Stack>
        </Paper>

        {/* Base58 Validation */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Base58 Validation & Decode</Title>
            <TextInput
              label="Base58 String"
              placeholder="Enter base58 encoded string"
              value={base58Input}
              onChange={(e) => setBase58Input(e.target.value)}
            />
            {base58Result && (
              <Stack spacing="xs">
                <Group spacing="xs">
                  <ValidationBadge isValid={base58Result.valid} trueLabel="Valid Base58" falseLabel="Invalid Base58" />
                </Group>
                {base58Result.valid && base58Result.bytes && (
                  <ResultRow label="Decoded (hex)" value={base58Result.bytes} />
                )}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Hex Validation */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Hex Validation</Title>
            <TextInput
              label="Input"
              placeholder="Enter string to check if valid hex"
              value={bytesInput}
              onChange={(e) => setBytesInput(e.target.value)}
            />
            {bytesInput && (
              <Group spacing="xs">
                <ValidationBadge isValid={isHexString(bytesInput)} trueLabel="Valid Hex" falseLabel="Invalid Hex" />
                {isHexString(bytesInput) && (
                  <Text size="sm" c="dimmed">Length: {bytesInput.length / 2} bytes</Text>
                )}
              </Group>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default EncodingUtils
