import {
  createStyles,
  Header,
  Group,
  Text,
  Burger,
  rem,
  Menu,
  Button,
  Image,
  useMantineTheme,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import LightDarkModeButton from './LightDarkButton'
import { Link } from 'react-router-dom'

import { AlephiumConnectButton } from '@alephium/web3-react'
import { useNetworkId } from '../utils/utils'
import AlephiumLight from '../assets/alephium-light.png'
import AlephiumDark from '../assets/alephium-dark.png'

const useStyles = createStyles((theme) => ({
  link: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: rem(42),
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: '100%',
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    '&:active': theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
}))

export function AppHeader() {
  const [drawerOpened, { toggle: toggleDrawer }] = useDisclosure(false)
  const { classes } = useStyles()

  const theme = useMantineTheme()
  const [network, setNetwork] = useNetworkId()

  return (
    <Header height={60} px="md">
      <Group position="apart" sx={{ height: '100%' }}>
        {/* <Text
          component={Link}
          to="/"
          fw="bold"
          fz="1.5rem"
          variant="gradient"
          gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
        >
          Alephium Toolkit
        </Text> */}
        <Image
          src={theme.colorScheme === 'dark' ? AlephiumDark : AlephiumLight}
          height={55}
          width={'auto'}
          ml={'sm'}
        />

        <Group className={classes.hiddenMobile}>
          <LightDarkModeButton />
          <Menu>
            <Menu.Target>
              <Button
                size="md"
                w="5.25rem"
                tt="capitalize"
                radius={'md'}
                compact
                variant="outline"
              >
                {network}
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item onClick={() => setNetwork('mainnet')}>
                Mainnet
              </Menu.Item>
              <Menu.Item onClick={() => setNetwork('testnet')}>
                Testnet
              </Menu.Item>
              <Menu.Item onClick={() => setNetwork('devnet')}>Devnet</Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <AlephiumConnectButton />
        </Group>

        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          className={classes.hiddenDesktop}
        />
      </Group>
    </Header>
  )
}

export default AppHeader
