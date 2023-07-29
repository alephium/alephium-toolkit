import { useAccount } from '@alephium/web3-react';
import { Box, Button, Center, Table, Text, Tooltip, rem, useMantineTheme } from '@mantine/core';

function CopyTooltip({ value }: { value: string }) {
  return (
    <Tooltip label="Click to copy" position='top' color="indigo" withArrow>
      <Button variant='subtle' onClick={() => { navigator.clipboard.writeText(value)}}>{value}</Button>
    </Tooltip>
  )
}

function Caption({ caption }: { caption: string }) {
  const theme = useMantineTheme();
  return <td><Text fw="bold" c={
    theme.colorScheme === "dark" ? theme.colors.gray[0] : theme.colors.dark[8]
  }>{caption}</Text></td>
}

function WalletInfo() {
  const account = useAccount();

  return (
    <Center mt={rem("15%")}>
      <Box
      w={rem('70%')}
      mx="auto"
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        textAlign: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
        cursor: 'pointer',

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
          <td><CopyTooltip value={account?.account?.address ?? '???'}/></td>
        </tr>
        <tr key="pubkey">
          <Caption caption="Public Key"/>
          <td><CopyTooltip value={account?.account?.publicKey ?? '???'}/></td>
        </tr>
      </tbody>
    </Table>
      </Box>
    </Center>
  );
}

export default WalletInfo;
