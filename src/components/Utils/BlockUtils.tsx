import { useState } from 'react'
import {
  Stack,
  Title,
  Text,
  TextInput,
  Paper,
  Group,
} from '@mantine/core'
import {
  targetToDifficulty,
  difficultyToTarget,
  blockChainIndex,
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

function BlockUtils() {
  const [blockHash, setBlockHash] = useState('')
  const [targetInput, setTargetInput] = useState('')
  const [difficultyInput, setDifficultyInput] = useState('')

  const getBlockIndex = () => {
    if (!blockHash) return null
    try {
      return blockChainIndex(blockHash)
    } catch {
      return null
    }
  }

  const targetToDiff = () => {
    if (!targetInput) return null
    try {
      return targetToDifficulty(targetInput).toString()
    } catch {
      return null
    }
  }

  const diffToTarget = () => {
    if (!difficultyInput) return null
    try {
      return difficultyToTarget(BigInt(difficultyInput))
    } catch {
      return null
    }
  }

  const blockIndex = getBlockIndex()

  return (
    <Stack align="center" mt="xl" w="100%" maw={900} mx="auto" p="md">
      <Title order={2}>Block Utilities</Title>
      <Text c="dimmed">Tools for working with block data</Text>

      <Stack spacing="xl" w="100%" mt="md">
        {/* Block Chain Index */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Block Chain Index</Title>
            <Text size="sm" c="dimmed">Get the fromGroup and toGroup from a block hash</Text>
            <TextInput
              label="Block Hash"
              placeholder="Enter block hash"
              value={blockHash}
              onChange={(e) => setBlockHash(e.target.value)}
            />
            {blockIndex && (
              <Group spacing="md">
                <ResultRow label="From Group" value={blockIndex.fromGroup} />
                <ResultRow label="To Group" value={blockIndex.toGroup} />
              </Group>
            )}
          </Stack>
        </Paper>

        {/* Target to Difficulty */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Target <IconArrowRight size={16} style={{ display: 'inline' }} /> Difficulty</Title>
            <Text size="sm" c="dimmed">Convert compacted target to difficulty</Text>
            <TextInput
              label="Target (hex)"
              placeholder="e.g., 03010101"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
            />
            {targetToDiff() && (
              <ResultRow label="Difficulty" value={targetToDiff()!} />
            )}
          </Stack>
        </Paper>

        {/* Difficulty to Target */}
        <Paper p="md" withBorder>
          <Stack spacing="md">
            <Title order={4}>Difficulty <IconArrowRight size={16} style={{ display: 'inline' }} /> Target</Title>
            <Text size="sm" c="dimmed">Convert difficulty back to compacted target</Text>
            <TextInput
              label="Difficulty"
              placeholder="Enter difficulty as bigint"
              value={difficultyInput}
              onChange={(e) => setDifficultyInput(e.target.value)}
            />
            {diffToTarget() && (
              <ResultRow label="Target (hex)" value={diffToTarget()!} />
            )}
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  )
}

export default BlockUtils
