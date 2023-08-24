import { useWallet } from '@alephium/web3-react'
import { Center, rem } from '@mantine/core'
import MyTable from '../Misc/MyTable'
import CopyText from '../Misc/CopyText'
import { useEffect } from 'react'
import { NoWallet } from '../Misc/NoWallet'

function WalletInfo() {
  const wallet = useWallet()

  useEffect(() => {
    console.log(`===== useEffect`)
  })

  if (wallet === undefined) {
    return <NoWallet />
  }

  const account = wallet.account
  return (
    <Center h="80%">
      <MyTable
        w={900}
        data={{
          'Network Type': account?.network,
          'Address Group': account?.group,
          Address: <CopyText value={account?.address ?? '???'} />,
          'Public Key': <CopyText value={account?.publicKey ?? '???'} />,
        }}
      />
    </Center>
  )
}

export default WalletInfo
