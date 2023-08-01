import { useAccount } from '@alephium/web3-react';
import { Box, Button, Center, Container, CopyButton, Table, Text, Tooltip, rem, useMantineTheme } from '@mantine/core';
import MyTable from '../Misc/MyTable';

function CopyText({ value }: { value: string }) {
  return (
    <CopyButton value={value} timeout={1000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right" color="indigo">
          <Button variant='subtle' onClick={copy}>{value}</Button>
        </Tooltip>
      )}
    </CopyButton>
  )
}

function WalletInfo() {
  const account = useAccount();

  return (
    <Center h={rem("80%")}>
      <MyTable w={rem("40%")} data={{
        "Network Type": account?.account?.address,
        "Address Group": account?.account?.group,
        "Address": <CopyText value={account?.account?.address ?? '???'} />,
        "Public Key": <CopyText value={account?.account?.publicKey ?? '???'} />,
      }} />
    </Center>
  );
}

export default WalletInfo;
