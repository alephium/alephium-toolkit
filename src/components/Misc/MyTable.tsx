import {
  SpacingValue,
  SystemProp,
  Table,
  Text,
  useMantineTheme,
} from '@mantine/core'
import MyBox from './MyBox'

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
    <MyBox w={w} mx="auto" px="lg" py="lg" ta="center">
      <Table
        horizontalSpacing={'xs'}
        verticalSpacing={'xl'}
        fontSize={'md'}
        withColumnBorders
      >
        <tbody>{rows}</tbody>
      </Table>
    </MyBox>
  )
}

export default MyTable
