import {
  Anchor,
  Box,
  Button,
  Center,
  Chip,
  Grid,
  Group,
  Input,
  Loader,
  RingProgress,
  Select,
  Space,
  Stack,
  Stepper,
  Text,
  TextInput,
  ThemeIcon,
  rem,
} from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MyBox from '../Misc/MyBox'
import { FORM_INDEX, useForm } from '@mantine/form'
import { node } from '@alephium/web3'
import {
  defaultNewMultisigDappTx,
  isSignatureValid,
  newMultisigDappTxStorageKey,
  resetNewMultisigTx,
  submitMultisigTx,
  useAllMultisig,
  waitTxSubmitted,
} from './shared'
import CopyTextarea from '../Misc/CopyTextarea'
import { useAlephium, useExplorer, useExplorerFE, useNetworkId } from '../../utils/utils'
import { WalletConnectClient } from './wc-client'

function DappMultisigTx() {
  const initialValues = useMemo(() => {
    const storedValue = window.localStorage.getItem(newMultisigDappTxStorageKey)
    if (storedValue) {
      try {
        return JSON.parse(storedValue) as typeof defaultNewMultisigDappTx
      } catch (e) {
        console.log('Failed to parse stored value')
      }
    }
    return defaultNewMultisigDappTx
  }, [])
  const form = useForm<typeof defaultNewMultisigDappTx>({
    validateInputOnChange: [
      `destinations.${FORM_INDEX}.address`,
      `destinations.${FORM_INDEX}.alphAmount`,
      `signatures.${FORM_INDEX}.signature`,
    ],
    initialValues: initialValues,
    validate: {
      multisig: (value) => (value === '' ? 'Please select multisig' : null),
      signatures: {
        signature: (value) =>
          isSignatureValid(value) ? null : 'Invalid signature',
      },
    },
  })

  const allMultisig = useAllMultisig()
  const selectedConfig = useMemo(() => {
    if (form.values.multisig === '') return undefined
    return allMultisig.find((c) => c.name === form.values.multisig)!
  }, [form.values.multisig, allMultisig])

  const [submitTxResult, setSubmitTxResult] = useState<
    node.SubmitTxResult | undefined
  >()

  const nodeProvider = useAlephium()
  const explorerProvider = useExplorer()

  const [networkId] = useNetworkId()
  const [wcClient, setWcClient] = useState<WalletConnectClient>()

  const setUnsignedTx = useCallback((unsignedTx: string) => {
    form.setValues({ unsignedTx: unsignedTx, step: 1 })
  }, [form])

  const [buildTxError, setBuildTxError] = useState<string | undefined>()

  useEffect(() => {
    const connectWC = async () => {
      if (selectedConfig === undefined) {
        throw new Error(`Please select a multisig config`)
      }
      if (form.values.signers.length < selectedConfig.mOfN) {
        throw new Error(`Please select signers`)
      }
      if (form.values.wcURI !== '') {
        console.log(`Connecting to ${form.values.wcURI}`)
        // Copied from mobile-wallet
        const client = await WalletConnectClient.init(
          selectedConfig,
          form.values.signers,
          setUnsignedTx,
          setBuildTxError,
          networkId,
          nodeProvider,
          explorerProvider,
          {
            projectId: '6e2562e43678dd68a9070a62b6d52207',
            relayUrl: 'wss://relay.walletconnect.com',
            metadata: {
              name: 'Alephium mobile wallet',
              description: 'Alephium mobile wallet',
              url: 'https://github.com/alephium/mobile-wallet',
              icons: ['https://alephium.org/favicon-32x32.png'],
            },
          }
        )
        await client.pair(form.values.wcURI)
        setWcClient(client)
      }
    }

    connectWC().catch(console.log)
  }, [form.values.wcURI, nodeProvider, setUnsignedTx, setBuildTxError, selectedConfig, form.values.signers])

  const [txSubmitted, setTxSubmitted] = useState<boolean>(false)
  const [submitTxError, setSubmitTxError] = useState<string>()
  const submitTxCallback = useCallback(async () => {
    try {
      if (form.values.unsignedTx === undefined) {
        throw new Error('There is no unsigned tx')
      }

      const hasError = form.values.signatures.some((_, index) => {
        return form.validateField(`signatures.${index}.signature`).hasError
      })
      if (hasError) throw new Error(`Invalid signatures`)

      const submitTxResult = await submitMultisigTx(
        nodeProvider,
        form.values.multisig,
        form.values.signers,
        form.values.unsignedTx,
        form.values.signatures
      )
      console.log(
        `Submit multisig tx result: ${JSON.stringify(submitTxResult)}`
      )
      setSubmitTxResult(submitTxResult)
      form.setValues({ step: 3 })

      await waitTxSubmitted(explorerProvider, submitTxResult.txId)
      setTxSubmitted(true)
      setSubmitTxError(undefined)
      resetNewMultisigTx()
    } catch (error) {
      setSubmitTxError(`Error in tx submission: ${error}`)
      console.error(error)
    }
  }, [form, setSubmitTxResult])

  const explorerUrl = useExplorerFE()

  useEffect(() => {
    window.localStorage.setItem(
      newMultisigDappTxStorageKey,
      JSON.stringify(form.values)
    )
  }, [form.values])

  const reset = useCallback(() => {
    form.setValues(defaultNewMultisigDappTx)
    setBuildTxError(undefined)
  }, [form, setBuildTxError])

  return (
    <Box maw={1200} mx="auto" mt="5rem">
      <Grid columns={13}>
        <Grid.Col span={9}>
          {form.values.step === 0 ? (
            <Box mx="auto" mt="xl" ta="left">
              <Select
                w={'20rem'}
                mx="auto"
                size="md"
                placeholder="Select Multisig"
                data={allMultisig.map((multisig) => ({
                  value: multisig.name,
                  label: multisig.name,
                }))}
                value={form.values.multisig}
                onChange={(value) => {
                  reset()
                  form.setValues({ multisig: value ?? '' })
                }}
              />
              {selectedConfig && (
                <>
                  <MyBox mx="xl" mt="xl">
                    <Text ta="left" fw="700">
                      Select {selectedConfig.mOfN}-of-
                      {selectedConfig.pubkeys.length} Signers
                    </Text>
                    <Chip.Group
                      multiple
                      onChange={(signers) => {
                        const sortedSigners = signers.sort((name0, name1) => {
                          const index0 = selectedConfig.pubkeys.findIndex(
                            (obj) => obj.name === name0
                          )
                          const index1 = selectedConfig.pubkeys.findIndex(
                            (obj) => obj.name === name1
                          )
                          console.log(index0, index1)
                          return index0 - index1
                        })
                        const signatures = sortedSigners.map((signer) => ({
                          name: signer,
                          signature: '',
                        }))
                        form.setValues({
                          signers: sortedSigners,
                          signatures: signatures,
                        })
                      }}
                    >
                      <Group position="center" mt="lg">
                        {...selectedConfig.pubkeys.map((signer) => (
                          <Chip
                            value={signer.name}
                            variant="light"
                            radius="xl"
                            checked={form.values.signers.includes(signer.name)}
                            disabled={
                              form.values.signers.length >=
                                selectedConfig.mOfN &&
                              !form.values.signers.includes(signer.name)
                            }
                            style={{
                              marginRight: '0.5rem',
                              marginBottom: '0.5rem',
                            }}
                          >
                            {signer.name}
                          </Chip>
                        ))}
                      </Group>
                    </Chip.Group>
                  </MyBox>

                  {/* <Code block>{selectedSigners}</Code> */}

                  <MyBox mx="xl" mt="xl">
                    <Text ta="left" fw="700">
                      Connect to a dApp
                    </Text>
                    <TextInput
                      w={rem('40rem')}
                      mx="auto"
                      mt="md"
                      size="md"
                      value={form.values.wcURI}
                      onChange={(event) => {
                        console.log(event.currentTarget.value)
                        form.setValues({ wcURI: event.currentTarget.value })
                      }}
                      placeholder="Paste WalletConnect URI copied from dApp"
                      radius="md"
                      withAsterisk
                    />
                    {wcClient && (
                      <Group position="center" mt="lg">
                        <Text>It&apos;s paired now</Text>
                      </Group>
                    )}
                  </MyBox>

                  {buildTxError && (
                    <Text color="red" mt="lg" mx="lg">
                      {buildTxError}
                    </Text>
                  )}

                  <Group mt="lg" position="apart" mx="2rem">
                    <Button onClick={reset}>Reset</Button>
                  </Group>
                </>
              )}
            </Box>
          ) : form.values.step === 1 ? (
            <Box maw={800} mx="lg" mt="xl" ta="left">
              <Text fw="700" size="lg">
                Copy and share the transaction to signers
              </Text>
              <Input.Description ta="left" size="md">
                Signers should paste the transaction on the page{' '}
                <Anchor
                  href={`/alephium-toolkit/#/multisig/sign-tx`}
                  target="_blank"
                >
                  sign-tx
                </Anchor>
              </Input.Description>
              <Space h="lg" />
              <CopyTextarea
                value={form.values.unsignedTx ?? ''}
                variant="outline"
              />
              <Group mt="xl" position="apart" mx="lg">
                <Button
                  onClick={() => {
                    form.setValues({ step: 0 })
                  }}
                >
                  Back
                </Button>
                <Button
                  onClick={() => {
                    form.setValues({ step: 2 })
                  }}
                >
                  Next
                </Button>
              </Group>
            </Box>
          ) : form.values.step === 2 ? (
            <Box mx="auto" mt="xl" ta="left">
              <MyBox mx="lg">
                <Text ta="left" fw="700">
                  Signatures
                </Text>
                {form.values.signers.map((signer, index) => (
                  <Group position="apart" mt="md" mx="5rem" key={signer}>
                    <Text>{signer}:</Text>
                    <TextInput
                      w="32rem"
                      placeholder="Signature"
                      {...form.getInputProps(`signatures.${index}.signature`)}
                    />
                  </Group>
                ))}
              </MyBox>
              {submitTxError && (
                <Text color="red" mt="lg" mx="lg">
                  {submitTxError}
                </Text>
              )}
              <Group mt="xl" position="apart" mx="2rem">
                <Button
                  onClick={() => {
                    form.setValues({ step: 1 })
                  }}
                >
                  Back
                </Button>
                <Button onClick={submitTxCallback}>Submit</Button>
              </Group>
            </Box>
          ) : (
            <Box maw={900} mx="auto" mt="xl" ta="left">
              <Group position="center" mt="lg">
                {txSubmitted ? (
                  <RingProgress
                    sections={[{ value: 100, color: 'teal' }]}
                    size={16 * 20}
                    thickness={16 * 2}
                    label={
                      <Center>
                        <ThemeIcon
                          color="teal"
                          variant="light"
                          radius="xl"
                          size="xl"
                        >
                          <IconCheck size={42} />
                        </ThemeIcon>
                      </Center>
                    }
                  />
                ) : (
                  <Loader color="teal" size="16rem" />
                )}
              </Group>
              {txSubmitted && (
                <Stack mt="lg" mx="2rem">
                  <Text fw={400} fz="1.5rem" ta="center">
                    Transaction Submitted
                  </Text>
                  <Anchor
                    href={`${explorerUrl}/transactions/${submitTxResult?.txId}`}
                    target="_blank"
                    mx="auto"
                  >
                    View on Explorer
                  </Anchor>
                  <Button
                    mx="auto"
                    onClick={() => {
                      reset()
                      form.setValues({ step: 0 })
                    }}
                  >
                    Create more transactions
                  </Button>
                </Stack>
              )}
            </Box>
          )}
        </Grid.Col>

        <Grid.Col offset={1} span={3}>
          <Box maw={400} mx="auto" mt="2.5rem" ta="left">
            <Stepper
              active={form.values.step}
              onStepClick={(s) => form.setValues({ step: s })}
              orientation="vertical"
              allowNextStepsSelect={false}
              styles={(theme) => ({
                stepIcon: {
                  backgroundColor: theme.fn.variant({
                    variant: 'light',
                    color: theme.primaryColor,
                  }).background,
                },
              })}
            >
              <Stepper.Step
                label="Create"
                description="Create a new transaction"
                allowStepSelect={form.values.step !== 3 && form.values.step > 0}
              />
              <Stepper.Step
                label="Sign"
                description="Share the transaction to all signers for signatures"
                allowStepSelect={form.values.step !== 3 && form.values.step > 1}
              />
              <Stepper.Step
                label="Submit"
                description="Aggregate all signatures and submit the transaction"
                allowStepSelect={form.values.step !== 3 && form.values.step > 2}
              />
              <Stepper.Step
                label="Transaction"
                description="Available on the explorer"
              />
            </Stepper>
          </Box>
        </Grid.Col>
      </Grid>
    </Box>
  )
}

export default DappMultisigTx
