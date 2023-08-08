import { useAccount, useBalance } from '@alephium/web3-react';
import {  Center, rem } from '@mantine/core';
import MyTable from '../Misc/MyTable';
import CopyText from '../Misc/CopyText';
import { useEffect } from 'react';

function WalletInfo() {
  const account = useAccount();
  const { balance } = useBalance();

  console.log(`==== `, balance)

  useEffect(() => {
    console.log(`===== useEffect`)
  })

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
