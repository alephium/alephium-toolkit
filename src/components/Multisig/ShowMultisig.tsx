import {
  Alert,
  Box,
  Button,
  CopyButton,
  Grid,
  Group,
  Mark,
  Modal,
  Select,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  AllMultisig,
  MultisigConfig,
  buildMultisigAddress,
  configToSting,
  removeMultisigConfig,
  useAllMultisig,
} from './shared'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDisclosure } from '@mantine/hooks'
import { IconAlertCircle } from '@tabler/icons-react'
import MyTable from '../Misc/MyTable'
import CopyTextarea from '../Misc/CopyTextarea'
import { addressFromPublicKey } from '@alephium/web3'

function useMultisigConfig(): [
  AllMultisig,
  string | undefined,
  MultisigConfig | undefined
] {
  const allMultisig = useAllMultisig()
  const location = useLocation()

  const urlParams = new URLSearchParams(location.search)
  const multisigName = urlParams.get('name')

  console.log(location.search, urlParams, multisigName)

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
  const [opened, { open, close }] = useDisclosure(false)
  const navigate = useNavigate()

  return (
    <Box maw={850} mx="auto" mt="5rem" ta={'left'}>
      <Group position="center">
        <Text fw="700" size="xl">
          Select Multisig
        </Text>
        <Select
          size="md"
          placeholder="Pick one"
          data={allMultisig.map((multisig) => ({
            value: multisig.name,
            label: multisig.name,
          }))}
          value={multisigName}
          onChange={(value) => navigate('/multisig/show?name=' + value)}
        />
      </Group>

      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        styles={{
          inner: {
            right: 0,
          },
        }}
      >
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Attention!"
          color="red"
          mt="lg"
        >
          This action will remove multisig <Mark>{multisigName}</Mark> from your
          browser. You will need to re-import the configuration to use it again.
        </Alert>
        <Group position="center" mt="lg">
          <Button
            color="red"
            onClick={() => {
              close()
              if (multisigName) {
                removeMultisigConfig(multisigName)
                navigate('/multisig/show')
              }
            }}
          >
            Confirm
          </Button>
        </Group>
      </Modal>

      {multisigName && theMultisig && (
        <Box mx="auto" mt="2rem" w="100%">
          <MyTable
            data={{
              Address: (
                <Group position="center" mx="auto">
                  <CopyTextarea value={buildMultisigAddress(theMultisig)} />
                </Group>
              ),
              'Number of Signers': theMultisig.pubkeys.length,
              'Required Signers': theMultisig.mOfN,
              Signers: (
                <Grid>
                  {theMultisig.pubkeys.map(({ name, pubkey }) => [
                    <Grid.Col span={2} key={pubkey}>
                      <Stack h="100%">
                        <Text fw="450" my="auto" ta="right">
                          {name}:
                        </Text>
                      </Stack>
                    </Grid.Col>,
                    <Grid.Col span={10} key={pubkey}>
                      <CopyTextarea value={addressFromPublicKey(pubkey)} />
                    </Grid.Col>,
                  ])}
                </Grid>
              ),
            }}
          />
          <Group position="apart" mt="2rem" mx="lg">
            <Button onClick={open}>Remove</Button>
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
