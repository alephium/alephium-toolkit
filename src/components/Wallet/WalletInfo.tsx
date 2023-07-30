import { useAccount } from '@alephium/web3-react';
import { Box, Button, Center, CopyButton, Table, Text, Tooltip, rem, useMantineTheme } from '@mantine/core';

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

function Caption({ caption }: { caption: string }) {
  const theme = useMantineTheme();
  return <td>
    <Text fw="bold" c={
    theme.colorScheme === "dark" ? theme.colors.gray[0] : theme.colors.dark[8]
  }>{caption}</Text>
  </td>
}

function WalletInfo() {
  const account = useAccount();

  return (
    <Center mt={rem("15%")}>
      <Box
      w={rem('65%')}
      mx="auto"
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        textAlign: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,

        // '&:hover': {
        //   backgroundColor:
        //     theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        // },
      })}
    >

    <Table horizontalSpacing={"xs"} verticalSpacing={"xl"} fontSize={"md"} highlightOnHover withColumnBorders>
      <tbody>
        <tr key="network">
          <Caption caption="Network Type"/>
          <td>{account?.account?.address}</td>
        </tr>
        <tr key="group">
          <Caption caption="Address Group"/>
          <td>{account?.account?.group}</td>
        </tr>
        <tr key="address">
          <Caption caption="Address"/>
          <td><CopyText value={account?.account?.address ?? '???'}/></td>
        </tr>
        <tr key="pubkey">
          <Caption caption="Public Key"/>
          <td><CopyText value={account?.account?.publicKey ?? '???'}/></td>
        </tr>
      </tbody>
    </Table>
      </Box>
    </Center>
  );
}

export default WalletInfo;
