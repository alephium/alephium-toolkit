import { useAccount } from '@alephium/web3-react';
import { Button, Center, Table, Text, Tooltip, rem } from '@mantine/core';

function CopyTooltip({ value }: { value: string }) {
  return (
    <Tooltip label="Copy" position='top-end' color="grape">
      <Button variant='subtle' onClick={() => { navigator.clipboard.writeText(value)}}>{value}</Button>
    </Tooltip>
  )
}

function WalletInfo() {
  const account = useAccount();

  return (
    <Center maw={rem('70%')} mx="auto" mt={200}>
    <Table horizontalSpacing={"md"} verticalSpacing={"xl"} fontSize={"md"} highlightOnHover={true}>
      <tbody>
        <tr key="network">
          <td>
            <Text fw="bold" c={"dark"}>Network Type:</Text>
          </td>
          <td>{account?.account?.address}</td>
        </tr>
        <tr key="group">
          <td>
            <Text fw="bold" c={"dark"}>Address Group:</Text>
          </td>
          <td>{account?.account?.group}</td>
        </tr>
        <tr key="address">
          <td>
            <Text fw="bold" c={"dark"}>Address:</Text>
          </td>
          <td><CopyTooltip value={account?.account?.address ?? '???'}/></td>
        </tr>
        <tr key="pubkey">
          <td>
            <Text fw="bold" c={"dark"}>Public Key:</Text>
          </td>
          <td><CopyTooltip value={account?.account?.publicKey ?? '???'}/></td>
        </tr>
      </tbody>
    </Table>
    </Center>
  );
}

export default WalletInfo;
