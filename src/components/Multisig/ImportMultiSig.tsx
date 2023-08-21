import { Box, Button, Group, Text, Textarea } from "@mantine/core";
import { useCallback, useState } from "react";
import { MultisigConfig, addMultisigConfig, isMultisigExists, isPubkeyValid } from "./shared";
import { useNavigate } from "react-router-dom";

function validateConfigJson(config: any): MultisigConfig {
  const name = config['name']
  if (name === undefined || name === '') {
    throw new Error('Invalid config name')
  }
  if (isMultisigExists(name)) {
    throw new Error('The multisig already exists')
  }
  const pubkeys = config['pubkeys']
  if (pubkeys === undefined || !Array.isArray(pubkeys)) {
    throw new Error('Expected a non-empty pubkey array')
  }
  const pubkeyLength = pubkeys.length
  if (pubkeyLength === 0) {
    throw new Error('The pubkey list is empty')
  }
  pubkeys.forEach((pubkeyConfig, idx) => {
    const name = pubkeyConfig['name']
    if (name === undefined || name === '') {
      throw new Error(`Invalid name in the pubkeys list, index: ${idx}`)
    }
    const pubkey = pubkeyConfig['pubkey']
    if (pubkey === undefined || !isPubkeyValid(pubkey)) {
      throw new Error(`Invalid pubkey in the pubkeys list, index: ${idx}`)
    }
  })
  const mOfN = config['mOfN']
  if (mOfN === undefined || typeof mOfN !== 'number') {
    throw new Error('Invalid mOfN')
  }
  if (mOfN < 1 || mOfN > pubkeyLength) {
    throw new Error('Invalid value of mOfN')
  }
  return config as MultisigConfig
}

function ImportMultisig() {
  const [error, setError] = useState<string | undefined>()
  const [config, setConfig] = useState<MultisigConfig | undefined>()
  const navigate = useNavigate()

  const onImportClick = useCallback(() => {
    if (config !== undefined) {
      addMultisigConfig({ ...config, address: '???'}) // TODO: generate address
      navigate('/multisig/show?name=' + config.name)
    }
  }, [config, navigate])

  const onContentChange = useCallback((content: string) => {
    setError(undefined)
    if (content === '') {
      setError('Please input the configuration')
      return
    }
    try {
      const parsed = JSON.parse(content)
      const config = validateConfigJson(parsed)
      setConfig(config)
    } catch (error) {
      setError(`${error}`)
    }
  }, [setConfig, setError])

  return (
    <Box maw={900} mx="auto" mt="xl">
      <Text ta='left' fw="700">Multisig configuration</Text>
      <Textarea
        placeholder="Paste your configuration here"
        minRows={8}
        mt="md"
        onChange={(event) => onContentChange(event.target.value)}
      />
      <Group position="right" mt="lg">
        {error ? <Text color='red'>{error}</Text> : null}
        <div style={{ flex: 1 }}></div>
        <Button color='indigo' onClick={onImportClick} disabled={error !== undefined || config === undefined}>
          Import Multisig
        </Button>
      </Group>
    </Box>
  );
}

export default ImportMultisig;
