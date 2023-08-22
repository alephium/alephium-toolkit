import {
  Box,
  Button,
  CopyButton,
  Group,
  Select,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  AllMultisig,
  MultisigConfig,
  configToSting,
  useAllMultisig,
} from './shared'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

function useMultisigConfig(): [
  AllMultisig,
  string | undefined,
  MultisigConfig | undefined
] {
  const allMultisig = useAllMultisig()

  const queryString = window.location.search
  const urlParams = new URLSearchParams(queryString)
  const multisigName = urlParams.get('name')

  if (multisigName) {
    const theMultisig = allMultisig.find(
      (multisig) => multisig.name === multisigName
    )

    if (theMultisig === undefined) {
      return [allMultisig, multisigName, undefined]
    } else {
      return [allMultisig, multisigName, theMultisig]
    }
  } else {
    return [allMultisig, undefined, undefined]
  }
}

function ShowMultiSig() {
  const [allMultisig, multisigName, theMultisig] = useMultisigConfig()
  const navigate = useNavigate()

  return (
    <Box maw={700} mx="auto" mt="xl" ta={'left'}>
      <Select
        w={'30rem'}
        mx="auto"
        label="Select Multisig"
        placeholder="Pick one"
        data={allMultisig.map((multisig) => ({
          value: multisig.name,
          label: multisig.name,
        }))}
        value={multisigName}
        onChange={(value) => navigate('/multisig/show?name=' + value)}
      />

      {multisigName && theMultisig && (
        <Box>
          <Text ta="right" fw="700" mt="lg">
            TODO: Show Multisig Details
          </Text>
          <Group position="apart" mt="lg">
            <Button color="indigo" onClick={() => {}}>
              Remove !!!
            </Button>
            <CopyButton value={configToSting(theMultisig)} timeout={1000}>
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? 'Copied' : null}
                  opened={copied}
                  withArrow
                >
                  <Button onClick={copy}>Export</Button>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Box>
      )}
    </Box>
  )
}

export default ShowMultiSig
