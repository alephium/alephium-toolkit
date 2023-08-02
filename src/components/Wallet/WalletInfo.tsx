import { useAccount } from '@alephium/web3-react';
import {  Center, rem } from '@mantine/core';
import MyTable from '../Misc/MyTable';
import CopyText from '../Misc/CopyText';

function WalletInfo() {
  const account = useAccount();

  return (
    <Center h={rem("80%")}>
      <MyTable w={rem("60rem")} data={{
        "Network Type": account?.account?.address,
        "Address Group": account?.account?.group,
        "Address": <CopyText value={account?.account?.address ?? '???'} />,
        "Public Key": <CopyText value={account?.account?.publicKey ?? '???'} />,
      }} />
    </Center>
  );
}

export default WalletInfo;
