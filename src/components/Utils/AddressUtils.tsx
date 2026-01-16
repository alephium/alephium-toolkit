import { useState } from 'react'
import {
  Stack,
  Title,
  Text,
  TextInput,
  Paper,
  Group,
  Badge,
  NumberInput,
} from '@mantine/core'
import {
  addressFromContractId,
  contractIdFromAddress,
  groupOfAddress,
  isAssetAddress,
  isContractAddress,
  isValidAddress,
  subContractId,
  addressFromPublicKey,
  contractIdFromTx,
  tokenIdFromAddress,
  addressFromTokenId,
  isGrouplessAddress,
  binToHex,
} from '@alephium/web3'
import { IconCheck, IconX, IconArrowRight } from '@tabler/icons-react'
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

function AddressUtils() {
  const [address, setAddress] = useState('')
  const [contractId, setContractId] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [parentContractId, setParentContractId] = useState('')
  const [subContractPath, setSubContractPath] = useState('')
  const [subContractGroup, setSubContractGroup] = useState<number | ''>(0)
  const [txId, setTxId] = useState('')
  const [outputIndex, setOutputIndex] = useState<number | ''>(0)

  const getAddressInfo = () => {
    if (!address) return null
    try {
      const valid = isValidAddress(address)
      if (!valid) return { valid: false }
      return {
        valid: true,
        group: groupOfAddress(address),
        isAsset: isAssetAddress(address),
        isContract: isContractAddress(address),
        isGroupless: isGrouplessAddress(address),
        contractId: isContractAddress(address) ? binToHex(contractIdFromAddress(address)) : undefined,
        tokenId: isContractAddress(address) ? binToHex(tokenIdFromAddress(address)) : undefined,
      }
    } catch {
      return { valid: false }
    }
  }

  const getAddressFromContractId = () => {
    if (!contractId) return null
    try {
      return addressFromContractId(contractId)
    } catch {
      return null
    }
  }

  const getAddressFromTokenId = () => {
    if (!tokenId) return null
    try {
      return addressFromTokenId(tokenId)
    } catch {
      return null
    }
  }

  const getAddressFromPublicKey = () => {
    if (!publicKey) return null
    try {
      return addressFromPublicKey(publicKey)
    } catch {
      return null
    }
  }

  const getSubContractId = () => {
    if (!parentContractId || !subContractPath || subContractGroup === '') return null
    try {
      return subContractId(parentContractId, subContractPath, subContractGroup)
    } catch {
      return null
    }
  }

  const getContractIdFromTx = () => {
    if (!txId || outputIndex === '') return null
    try {
      return contractIdFromTx(txId, outputIndex)
    } catch {
      return null
    }
  }

  const addressInfo = getAddressInfo()

  return (
    <Stack align="center" mt="xl" w="100%" maw={900} mx="auto" p="md">
      <Title order={2}>Address Utilities</Title>
      <Text c="dimmed">Tools for working with Alephium addresses</Text>

      <Stack spacing="xl" w="100%" mt="md">
        {/* Address Info */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Address Information</Title>
            <Text size="sm" c="dimmed">Paste an address to get its group, type, and related IDs</Text>
            <TextInput
              label="Address"
              placeholder="Enter an Alephium address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {addressInfo && (
              <Stack spacing="xs">
                <Group spacing="xs">
                  <ValidationBadge isValid={addressInfo.valid} trueLabel="Valid" falseLabel="Invalid" />
                  {addressInfo.valid && (
                    <>
                      <ValidationBadge isValid={addressInfo.isAsset!} trueLabel="Asset Address" falseLabel="Not Asset" />
                      <ValidationBadge isValid={addressInfo.isContract!} trueLabel="Contract Address" falseLabel="Not Contract" />
                      {addressInfo.isGroupless && <Badge color="blue">Groupless</Badge>}
                    </>
                  )}
                </Group>
                {addressInfo.valid && (
                  <>
                    <ResultRow label="Group" value={addressInfo.group} />
                    {addressInfo.contractId && <ResultRow label="Contract ID" value={addressInfo.contractId} />}
                    {addressInfo.tokenId && <ResultRow label="Token ID" value={addressInfo.tokenId} />}
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </Paper>

        {/* Contract ID to Address */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Contract ID <IconArrowRight size={16} style={{ display: 'inline' }} /> Address</Title>
            <TextInput
              label="Contract ID"
              placeholder="Enter a contract ID (64 hex characters)"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
            />
            {getAddressFromContractId() && (
              <ResultRow label="Contract Address" value={getAddressFromContractId()!} />
            )}
          </Stack>
        </Paper>

        {/* Token ID to Address */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Token ID <IconArrowRight size={16} style={{ display: 'inline' }} /> Address</Title>
            <TextInput
              label="Token ID"
              placeholder="Enter a token ID (64 hex characters)"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
            />
            {getAddressFromTokenId() && (
              <ResultRow label="Token Address" value={getAddressFromTokenId()!} />
            )}
          </Stack>
        </Paper>

        {/* Public Key to Address */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Public Key <IconArrowRight size={16} style={{ display: 'inline' }} /> Address</Title>
            <TextInput
              label="Public Key"
              placeholder="Enter a public key (66 hex characters)"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
            {getAddressFromPublicKey() && (
              <ResultRow label="Address" value={getAddressFromPublicKey()!} />
            )}
          </Stack>
        </Paper>

        {/* Sub-contract ID */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Sub-contract ID</Title>
            <Text size="sm" c="dimmed">Calculate the sub-contract ID from a parent contract</Text>
            <TextInput
              label="Parent Contract ID"
              placeholder="Enter parent contract ID"
              value={parentContractId}
              onChange={(e) => setParentContractId(e.target.value)}
            />
            <TextInput
              label="Path (hex)"
              placeholder="e.g., 00"
              value={subContractPath}
              onChange={(e) => setSubContractPath(e.target.value)}
            />
            <NumberInput
              label="Group"
              placeholder="0-3"
              value={subContractGroup}
              onChange={setSubContractGroup}
              min={0}
              max={3}
            />
            {getSubContractId() && (
              <ResultRow label="Sub-contract ID" value={getSubContractId()!} />
            )}
          </Stack>
        </Paper>

        {/* Contract ID from Transaction */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Contract ID from Transaction</Title>
            <Text size="sm" c="dimmed">Get the contract ID created by a transaction</Text>
            <TextInput
              label="Transaction ID"
              placeholder="Enter transaction ID"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
            />
            <NumberInput
              label="Output Index"
              placeholder="0"
              value={outputIndex}
              onChange={setOutputIndex}
              min={0}
            />
            {getContractIdFromTx() && (
              <ResultRow label="Contract ID" value={getContractIdFromTx()!} />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default AddressUtils
