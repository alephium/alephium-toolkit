import { useForm } from '@mantine/form'
import {
  TextInput,
  Button,
  Group,
  Box,
  Center,
  rem,
  Stack,
  NumberInput,
} from '@mantine/core'
import { useWallet, useBalance } from '@alephium/web3-react'
import { DeployNewToken } from '../../../artifacts/ts'
import { loadDeployments } from '../../../artifacts/ts/deployments'
import { ONE_ALPH, SignerProvider } from '@alephium/web3'
import { Buffer } from 'buffer'

const network = 'devnet'

async function deployNewToken(
  signer: SignerProvider,
  {
    name,
    symbol,
    decimals,
    supply,
  }: { name: string; symbol: string; decimals: number; supply: number }
) {
  const deployments = loadDeployments(network)
  console.log(await signer.getSelectedAccount())
  const result = await DeployNewToken.execute(signer, {
    initialFields: {
      templateId: deployments.contracts.SimpleToken.contractInstance.contractId,
      name: Buffer.from(name, 'utf-8').toString('hex'),
      symbol: Buffer.from(symbol, 'utf-8').toString('hex'),
      decimals: BigInt(decimals),
      initialSupply: BigInt(supply) * BigInt(10 ** decimals),
    },
    attoAlphAmount: ONE_ALPH,
  })
  console.log(result)
}

function NewToken() {
  const wallet = useWallet()
  const form = useForm({
    initialValues: {
      name: '',
      symbol: '',
      decimals: 18,
      supply: 1000_000,
    },

    validate: {
      name: (value) =>
        value.length < 3 ? 'Name must have at least 3 letters' : null,
      symbol: (value) =>
        /[A-Z]{3,6}/.test(value) ? null : 'Symbol must be 3-6 capital letters',
      decimals: (value) =>
        value < 0 || value > 18 ? 'Decimals must be between 0 and 18' : null,
      supply: (value) =>
        value < 0 || !Number.isInteger(value)
          ? 'Supply must be positive integer'
          : null,
    },
  })
  const { balance, updateBalanceForTx } = useBalance()

  console.log(`==== `, balance, updateBalanceForTx)

  if (wallet === undefined || wallet.signer === undefined) {
    return <></>
  }

  return (
    <Center h={rem('80%')}>
      <Stack>
        <Box ta="left" w="40rem" mx="auto">
          <TextInput
            label="Token Name"
            placeholder="Token Name"
            {...form.getInputProps('name')}
          />
          <TextInput
            mt="md"
            label="Token Symbol (3-6 capital letters)"
            placeholder="Token Symbol"
            {...form.getInputProps('symbol')}
          />
          <TextInput
            mt="md"
            label="Decimals"
            placeholder="Decimals"
            {...form.getInputProps('decimals')}
          />
          <NumberInput
            mt="md"
            label="Token Supply"
            placeholder="supply"
            hideControls
            {...form.getInputProps('supply')}
          />
          <TextInput
            mt="md"
            label="Owner"
            placeholder=""
            value={wallet.account?.address}
            disabled
          />
        </Box>

        <Group position="center" mt="xl">
          <Button
            variant="outline"
            onClick={() => {
              // deployNewToken(context.signerProvider!, form.values)
              updateBalanceForTx(
                'fe9ede54e19411ccdbaaa620e1249fffeeb494266c26d2a9d1e6e6aec16d0bfe'
              )
            }}
          >
            Create
          </Button>
        </Group>
      </Stack>
    </Center>
  )
}

export default NewToken
