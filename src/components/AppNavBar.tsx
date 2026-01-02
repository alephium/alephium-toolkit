import { Navbar, ScrollArea, createStyles, rem } from '@mantine/core'
import {
  IconNotes,
  IconCalendarStats,
  IconGauge,
  IconPresentationAnalytics,
  IconFileAnalytics,
  IconSignature,
} from '@tabler/icons-react'
import { LinksGroup } from './AppNavBarLinkGroup'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const mockdata = [
  {
    label: 'Wallet Info',
    icon: IconGauge,
    groupLink: '/',
  },
  {
    label: 'Sign Message',
    icon: IconSignature,
    groupLink: '/sign-message',
  },
  {
    label: 'Fungible Tokens',
    icon: IconNotes,
    initiallyOpened: false,
    links: [
      // { label: 'Show all tokens', link: '/token/all' },
      { label: 'Token info', link: '/token/info' },
      { label: 'Issue new tokens', link: '/token/new' },
      { label: 'Burn tokens', link: '/token/burn' },
    ],
  },
  {
    label: 'NFT',
    icon: IconCalendarStats,
    initiallyOpened: false,
    links: [
      // { label: 'Show all NFTs', link: '/nft/all' },
      { label: 'NFT info', link: '/nft/info' },
      { label: 'Create new collection', link: '/nft/new-collection' },
      { label: 'Burn NFTs', link: '/nft/burn' },
    ],
  },
  {
    label: 'Contracts',
    icon: IconFileAnalytics,
    initiallyOpened: false,
    links: [
      { label: 'Playground', link: '/contract/play' },
      { label: 'Contract info', link: '/contract/info' },
      { label: 'Deploy Contract', link: '/contract/deploy' },
    ],
  },
  {
    label: 'Multisig',
    icon: IconPresentationAnalytics,
    initiallyOpened: true,
    links: [
      { label: 'Create Multisig', link: '/multisig/create' },
      { label: 'Import Multisig', link: '/multisig/import' },
      { label: 'Show Multisig', link: '/multisig/show' },
      { label: 'Build Transaction', link: '/multisig/build-tx' },
      { label: 'Sign Transaction', link: '/multisig/sign-tx' },
    ],
  },
  // { label: 'Settings', icon: IconAdjustments },
  // {
  //   label: 'Security',
  //   icon: IconLock,
  //   links: [
  //     { label: 'Enable 2FA', link: '/' },
  //     { label: 'Change password', link: '/' },
  //     { label: 'Recovery codes', link: '/' },
  //   ],
  // },
]

const useStyles = createStyles((theme) => ({
  navbar: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    paddingBottom: 0,
  },

  header: {
    padding: theme.spacing.md,
    paddingTop: 0,
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },

  links: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
  },

  linksInner: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  footer: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]
    }`,
  },
}))

export function NavbarNested() {
  const { classes } = useStyles()
  const location = useLocation()
  const [active, setActive] = useState<string>(location.pathname)

  useEffect(() => {
    setActive(location.pathname)
  }, [location.pathname])

  const links = mockdata.map((item) => (
    <LinksGroup
      {...item}
      key={item.label}
      active={active}
      setActive={setActive}
    />
  ))

  return (
    <Navbar width={{ sm: 300 }} p="md" className={classes.navbar}>
      {/* <Navbar.Section className={classes.header}>
        <Group position="apart">
          <Logo width={rem(120)} />
          <Code sx={{ fontWeight: 700 }}>v3.1.2</Code>
        </Group>
      </Navbar.Section> */}

      <Navbar.Section grow className={classes.links} component={ScrollArea}>
        <div className={classes.linksInner}>{links}</div>
      </Navbar.Section>

      {/* <Navbar.Section className={classes.footer}>
        <UserButton
          image="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
          name="Ann Nullpointer"
          email="anullpointer@yahoo.com"
        />
      </Navbar.Section> */}
    </Navbar>
  )
}

export default NavbarNested
