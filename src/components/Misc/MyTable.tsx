import {
  Box,
  SpacingValue,
  SystemProp,
  Table,
  Text,
  rem,
  useMantineTheme,
} from '@mantine/core'

function Caption({ caption }: { caption: string }) {
  const theme = useMantineTheme()
  return (
    <Text
      fw="bold"
      c={
        theme.colorScheme === 'dark'
          ? theme.colors.gray[0]
          : theme.colors.dark[8]
      }
    >
      {caption}
    </Text>
  )
}

interface MyTableProps {
  w?: SystemProp<SpacingValue> | undefined
  data: { [key: string]: string | React.ReactNode }
}

function MyTable({ w, data }: MyTableProps) {
  const rows = Object.entries(data).map(([key, value]) => (
    <tr key={key}>
      <td width={'30%'}>
        <Caption caption={key}></Caption>
      </td>
      <td width={'70%'}>{value}</td>
    </tr>
  ))

  return (
    <Box
      w={w}
      mx="auto"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === 'dark'
            ? theme.colors.dark[5]
            : theme.colors.gray[1],
        textAlign: 'center',
        padding: theme.spacing.xl,
        borderRadius: theme.radius.md,
      })}
    >
      <Table
        horizontalSpacing={'xs'}
        verticalSpacing={'xl'}
        fontSize={'md'}
        highlightOnHover
        withColumnBorders
      >
        <tbody>{rows}</tbody>
      </Table>
    </Box>
  )
}

export default MyTable
