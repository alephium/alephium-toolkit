import {
  Alert,
  Box,
  Button,
  CopyButton,
  Group,
  Mark,
  Modal,
  Select,
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
        <Box mx="auto" mt="xl" w="100%">
          <MyTable
            data={{
              Address: (
                <Group position="center" mx="auto">
                  <CopyTextarea value={buildMultisigAddress(theMultisig)} />
                </Group>
              ),
              // Address: <CopyText value={buildMultisigAddress(theMultisig)} />,
              'Number of Signers': theMultisig.pubkeys.length,
              'Required Signers': theMultisig.mOfN,
              // 'Address Group': groupOfAddress(
              //   addressFromPublicKey(theMultisig.pubkeys[0].pubkey)
              // ),
            }}
          />
          <Group position="apart" mt="lg">
            <Button onClick={open}>Remove !!!</Button>
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
