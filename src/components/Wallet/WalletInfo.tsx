import { useWallet } from '@alephium/web3-react'
import { Center, Text } from '@mantine/core'
import MyTable from '../Misc/MyTable'
import { NoWallet } from '../Misc/NoWallet'
import CopyTextarea from '../Misc/CopyTextarea'

function WalletInfo() {
  const { account, connectionStatus } = useWallet()

  console.log(`WalletInfo:`, account, connectionStatus)

  if (connectionStatus === 'connecting' && !account) return null
  if (connectionStatus === 'disconnected') return <NoWallet />

  return (
    <Center mt="10%">
      <MyTable
        w={900}
        data={{
          'Network Type': <Text tt="capitalize">{account?.network}</Text>,
          'Address Group': account?.group,
          Address: <CopyTextarea value={account?.address ?? '???'} />,
          'Public Key': <CopyTextarea value={account?.publicKey ?? '???'} />,
        }}
      />
    </Center>
  )
}

export default WalletInfo
