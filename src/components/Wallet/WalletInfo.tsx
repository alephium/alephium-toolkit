import { useWallet } from '@alephium/web3-react';
import {  Center, rem } from '@mantine/core';
import MyTable from '../Misc/MyTable';
import CopyText from '../Misc/CopyText';
import { useEffect } from 'react';

function WalletInfo() {
  const wallet = useWallet();

  useEffect(() => {
    console.log(`===== useEffect`)
  })
  
  if (wallet === undefined) {
    return <></>
  }

  const account = wallet.account;
  return (
    <Center h={rem("80%")}>
      <MyTable w={rem("60rem")} data={{
        "Network Type": account?.network,
        "Address Group": account?.group,
        "Address": <CopyText value={account?.address ?? '???'} />,
        "Public Key": <CopyText value={account?.publicKey ?? '???'} />,
      }} />
    </Center>
  );
}

export default WalletInfo;
