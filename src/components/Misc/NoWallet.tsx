import { createStyles, Title, Container, rem, Box, Text, Stack, Button, Group, Anchor } from '@mantine/core'
import { IconWallet, IconExternalLink } from '@tabler/icons-react'
import { AlephiumConnectButton } from '@alephium/web3-react'

const useStyles = createStyles((theme) => ({
  root: {
    paddingTop: rem(80),
    paddingBottom: rem(120),
    backgroundColor: theme.fn.variant({
      variant: 'filled',
      color: theme.primaryColor,
    }).background,
  },

  label: {
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(150),
    lineHeight: 1,
    marginBottom: `calc(${theme.spacing.xl} * 1.5)`,
    color: theme.colors[theme.primaryColor][3],

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(120),
    },
  },

  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    textAlign: 'center',
    fontWeight: 900,
    fontSize: rem(38),
    color: theme.white,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(32),
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
  },

  walletIcon: {
    width: rem(120),
    height: rem(120),
    margin: 'auto',
    marginBottom: theme.spacing.xl,
    color: theme.white,
    opacity: 0.8,
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
  },
}))

export function NoWallet() {
  const { classes } = useStyles()

  return (
    <Box maw={rem('70%')} mx="auto" mt={rem('15%')}>
      <div className={classes.root}>
        <Container>
          <IconWallet className={classes.walletIcon} stroke={1.5} />
          <div className={classes.label}>No Wallet</div>
          <Title className={classes.title}>Connect your wallet to continue</Title>

          <Text className={classes.instruction} ta="center">
            To use the Alephium Toolkit, you need to connect a compatible wallet.
          </Text>

          <Stack spacing="lg" mt="xl" align="center">
            <AlephiumConnectButton />

            <Text size="sm" ta="center" className={classes.dimmedText}>
              Don't have a wallet yet?
            </Text>

            <Group position="center" spacing="md">
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
