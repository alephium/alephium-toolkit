import { Alert } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

export const NoWalletAlert = () => (
  <Alert
    icon={<IconInfoCircle />}
    variant="light"
    color="blue"
    title="No wallet connected"
  >
    You must connect a wallet with funds to perform this operation.
  </Alert>
)
