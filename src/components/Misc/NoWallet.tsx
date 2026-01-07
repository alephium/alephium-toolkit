import { createStyles, Title, Container, rem, Box, Text, Stack, Group, Anchor } from '@mantine/core'
import { IconWallet, IconExternalLink } from '@tabler/icons-react'
import { AlephiumConnectButton } from '@alephium/web3-react'

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(40),
    paddingBottom: rem(80),
    minHeight: 'calc(100vh - 60px - 60px)',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.fn.variant({
      variant: 'filled',
      color: theme.primaryColor,
    }).background,

    [theme.fn.smallerThan('md')]: {
      paddingTop: rem(30),
      paddingBottom: rem(60),
    },

    [theme.fn.smallerThan('sm')]: {
      paddingTop: rem(20),
      paddingBottom: rem(40),
      minHeight: 'calc(100vh - 60px - 60px)',
    },
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(150),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colors[theme.primaryColor][3],

    [theme.fn.smallerThan('md')]: {
      fontSize: rem(80),
      marginBottom: theme.spacing.xl,
    },

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(48),
      marginBottom: theme.spacing.md,
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),
    color: theme.white,

    [theme.fn.smallerThan('md')]: {
      fontSize: rem(28),
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
    },

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(20),
      lineHeight: 1.3,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
    },
  },

  description: {
    maxWidth: rem(540),
    margin: 'auto',
    marginTop: theme.spacing.xl,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colors[theme.primaryColor][1],
  },

  instruction: {
    maxWidth: rem(600),
    margin: 'auto',
    marginTop: theme.spacing.md,
    color: theme.colors[theme.primaryColor][1],
    fontSize: theme.fontSizes.md,
    lineHeight: 1.6,

    [theme.fn.smallerThan('md')]: {
      fontSize: theme.fontSizes.md,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
    },

    [theme.fn.smallerThan('sm')]: {
      fontSize: theme.fontSizes.sm,
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
    },
  },

  walletIcon: {
    width: rem(120),
    height: rem(120),
    margin: 'auto',
    marginBottom: theme.spacing.xl,
    color: theme.white,
    opacity: 0.8,

    [theme.fn.smallerThan('md')]: {
      width: rem(100),
      height: rem(100),
      marginBottom: theme.spacing.lg,
    },

    [theme.fn.smallerThan('sm')]: {
      width: rem(70),
      height: rem(70),
      marginBottom: theme.spacing.sm,
    },
  },

  link: {
    color: theme.white,
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
      opacity: 0.9,
    },
  },

  dimmedText: {
    color: theme.colors[theme.primaryColor][1],

    [theme.fn.smallerThan('md')]: {
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.md,
    },

    [theme.fn.smallerThan('sm')]: {
      paddingLeft: theme.spacing.sm,
      paddingRight: theme.spacing.sm,
      fontSize: theme.fontSizes.sm,
    },
  },

  walletLinksGroup: {
    [theme.fn.smallerThan('md')]: {
      flexDirection: 'column',
      gap: theme.spacing.sm,
      width: '100%',
      maxWidth: rem(300),
    },

    [theme.fn.smallerThan('sm')]: {
      gap: theme.spacing.xs,
      maxWidth: rem(250),
    },
  },

  container: {
    [theme.fn.smallerThan('md')]: {
      padding: theme.spacing.sm,
    },

    [theme.fn.smallerThan('sm')]: {
      padding: theme.spacing.xs,
      maxWidth: '100%',
    },
  },

  connectButtonWrapper: {
    position: 'relative',
    zIndex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& button': {
      minHeight: rem(36),
      fontWeight: 600,
      fontSize: theme.fontSizes.md,
    },

    [theme.fn.smallerThan('md')]: {
      width: '100%',
      maxWidth: rem(300),
      padding: theme.spacing.sm,
      '& button': {
        fontSize: theme.fontSizes.sm,
      },
    },

    [theme.fn.smallerThan('sm')]: {
      maxWidth: rem(250),
      padding: theme.spacing.xs,
      '& button': {
        minHeight: rem(32),
      },
    },
  },
}))

export function NoWallet() {
  const { classes } = useStyles()

  return (
    <Box
      maw={rem('70%')}
      mx="auto"
      mt={0}
      sx={(theme) => ({
        [theme.fn.smallerThan('md')]: {
          maxWidth: '90%',
        },
        [theme.fn.smallerThan('sm')]: {
          maxWidth: '100%',
        },
      })}
    >
      <div className={classes.root}>
        <Container className={classes.container}>
          <IconWallet className={classes.walletIcon} stroke={1.5} />
          <div className={classes.label}>No Wallet</div>
          <Title className={classes.title}>Connect your wallet to continue</Title>

          <Text className={classes.instruction} ta="center">
            To use the Alephium Toolkit, you need to connect a compatible wallet.
          </Text>

          <Stack spacing="lg" mt="xl" align="center">
            <Box className={classes.connectButtonWrapper}>
              <AlephiumConnectButton />
            </Box>

            <Text size="sm" ta="center" className={classes.dimmedText}>
              Don't have a wallet yet?
            </Text>

            <Group position="center" spacing="md" className={classes.walletLinksGroup}>
              <Anchor
                href="https://github.com/alephium/extension-wallet/releases"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.link}
              >
                <Group spacing={5}>
                  <Text size="sm">Extension Wallet</Text>
                  <IconExternalLink size={16} />
                </Group>
              </Anchor>

              <Anchor
                href="https://github.com/alephium/alephium-frontend/tree/master/apps/mobile-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.link}
              >
                <Group spacing={5}>
                  <Text size="sm">Mobile Wallet</Text>
                  <IconExternalLink size={16} />
                </Group>
              </Anchor>

              <Anchor
                href="https://github.com/alephium/alephium-frontend/tree/master/apps/desktop-wallet"
                target="_blank"
                rel="noopener noreferrer"
                className={classes.link}
              >
                <Group spacing={5}>
                  <Text size="sm">Desktop Wallet</Text>
                  <IconExternalLink size={16} />
                </Group>
              </Anchor>
            </Group>
          </Stack>
        </Container>
      </div>
    </Box>
  )
}
