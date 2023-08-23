import { Box, Button, Group, Text, Textarea } from '@mantine/core'
import { useCallback, useState } from 'react'
import {
  MultisigConfig,
  addMultisigConfig,
  buildMultisigAddress,
  stringToConfig,
} from './shared'
import { useNavigate } from 'react-router-dom'

function ImportMultisig() {
  const [error, setError] = useState<string | undefined>()
  const [config, setConfig] = useState<MultisigConfig | undefined>()
  const navigate = useNavigate()

  const onImportClick = useCallback(() => {
    if (config !== undefined) {
      addMultisigConfig({ ...config, address: buildMultisigAddress(config) })
      navigate('/multisig/show?name=' + config.name)
    }
  }, [config, navigate])

  const onContentChange = useCallback(
    (content: string) => {
      setError(undefined)
      if (content === '') {
        setError('Please input the configuration')
        return
      }
      try {
        setConfig(stringToConfig(content))
      } catch (error) {
        setError(`${error}`)
      }
    },
    [setConfig, setError]
  )

  return (
    <Box maw={900} mx="auto" mt="xl">
      <Text ta="left" fw="700">
        Multisig configuration
      </Text>
      <Textarea
        placeholder="Paste your configuration here"
        minRows={8}
        mt="md"
        onChange={(event) => onContentChange(event.target.value)}
      />
      {error ? <Text color="red" mt="md">{error}</Text> : null}
      <Group position="right" mt="lg">
        <div style={{ flex: 1 }}></div>
        <Button
          color="indigo"
          onClick={onImportClick}
          disabled={error !== undefined || config === undefined}
        >
          Import Multisig
        </Button>
      </Group>
    </Box>
  )
}

export default ImportMultisig
