import { useForm, isInRange, hasLength } from '@mantine/form'
import {
  TextInput,
  Text,
  Button,
  Group,
  Box,
  Center,
  rem,
  Stack,
  NumberInput,
  Alert,
  Space,
  Title,
} from '@mantine/core'
import { useWallet } from '@alephium/web3-react'
import { deployNewToken } from './shared'
import { useNetworkId } from '../../utils/utils'
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react'
import { notifications } from '@mantine/notifications'

interface NewTokenSchema {
  name: string,
  symbol: string,
  decimals: number,
  supply: number,
}

function NewToken() {
  const [isSubmitting, setIsSubmitting]= useState(false)
  const { signer } = useWallet()
  const [networkId] = useNetworkId()
  const form = useForm<NewTokenSchema>({
    initialValues: {
      name: '',
      symbol: '',
      decimals: 18,
      supply: 1000_000,
    },
    validate: {
      name: hasLength({ min: 3 }, 'Name must have 3 or more characters'),
      symbol: (value) =>
        /[A-Z]{3,6}/.test(value) ? null : 'Symbol must be 3-6 capital letters',
      decimals: isInRange({min: 0, max: 18}, "Decimals must be between 0 and 18"),
      supply: isInRange({min: 1}, 'Supply must be a positive integer')
    },
  })

  const onSuccess = () => {
    notifications.show({
      title: 'Tokens successfully issued!',
      message: 'View your minting transaction here [TODO URL]',
    })
  }

  const onSubmit = (values: NewTokenSchema) => {
    setIsSubmitting(true)

    // TODO: use notification to show error
    deployNewToken(networkId, signer!, values).then(onSuccess).catch(console.error).finally(() => setIsSubmitting(false))
  }

  return (
    <Center h={rem('80%')}>
      <Stack>
        <Box ta="left" w="40rem" mx="auto" >
          {!signer && (
            <>
              <Alert icon={<IconInfoCircle />} variant='light' color="blue" title="No wallet connected">
                You must connect a wallet with funds to be able to issue new tokens.
              </Alert>
              <Space h="md" />
            </>
          )}
          <Title order={1}>Issue new tokens</Title>
          <Text size="xs" c="dimmed">Newly created tokens will be owned by your currently connected wallet account.</Text>
          <Space h="md" />
          <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            label="Token Name"
            withAsterisk
            placeholder="Token Name"
            {...form.getInputProps('name')}
          />
          <TextInput
            mt="md"
            label="Token Symbol"
            withAsterisk
            description="Symbol must be 3-6 capital letters"
            placeholder="Token Symbol"
            {...form.getInputProps('symbol')}
          />
          <TextInput
            mt="md"
            label="Decimals"
            withAsterisk
            description="Must be in the range of 0-18"
            placeholder="Decimals"
            {...form.getInputProps('decimals')}
          />
          <NumberInput
            mt="md"
            label="Token Supply"
            withAsterisk
            placeholder="supply"
            hideControls
            {...form.getInputProps('supply')}
          />
        <Group position="right" mt="xl">
          <Button
            type="submit"
            disabled={!signer}
            loading={isSubmitting}
          >
            Issue Tokens
          </Button>
        </Group>
          </form>
        </Box>
      </Stack>
    </Center>
  )
}

export default NewToken
