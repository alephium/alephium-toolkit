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
  NumberInput,
  RingProgress,
  Select,
  Space,
  Stack,
  Stepper,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core'
import { IconAt, IconCheck } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import MyBox from '../Misc/MyBox'
import { FORM_INDEX, useForm } from '@mantine/form'
import { convertAlphAmountWithDecimals, isBase58, node } from '@alephium/web3'
import {
  buildMultisigTx,
  defaultNewMultisigTx,
  isSignatureValid,
  newMultisigTxStorageKey,
  resetNewMultisigTx,
  submitMultisigTx,
  useAllMultisig,
  waitTxSubmitted,
} from './shared'
import CopyTextarea from '../Misc/CopyTextarea'
import { useAlephium, useExplorer, useExplorerFE } from '../../utils/utils'

function BuildMultisigTx() {
  const form = useForm<{
    multisig: string
    signers: string[]
    destinations: { address: string; alphAmount: string }[]
    unsignedTx: string | undefined
    signatures: { name: string; signature: string }[]
    step: number
  }>({
    validateInputOnChange: [
      `destinations.${FORM_INDEX}.address`,
      `destinations.${FORM_INDEX}.alphAmount`,
      `signatures.${FORM_INDEX}.signature`,
    ],
    initialValues: defaultNewMultisigTx,
    validate: {
      multisig: (value) => (value === '' ? 'Please select multisig' : null),
      destinations: {
        address: (value) =>
          value === ''
            ? 'Empty address'
            : !isBase58(value)
            ? 'Invalid address'
            : null,
        alphAmount: (value) => {
          if (value === '') return 'Empty amount'
          const amount = convertAlphAmountWithDecimals(value)
          return amount === undefined || amount <= 0n ? 'Invalid amount' : null
        },
      },
      signatures: {
        signature: (value) =>
          isSignatureValid(value) ? null : 'Invalid signature',
      },
    },
  })
  const allMultisig = useAllMultisig()

  const [submitTxResult, setSubmitTxResult] = useState<
    node.SubmitTxResult | undefined
  >()

  const nodeProvider = useAlephium()
  const explorerProvider = useExplorer()

  const [buildTxError, setBuildTxError] = useState<string | undefined>()
  const getInputPropsWithResetError = useCallback(
    (path: string) => {
      const inputProps = form.getInputProps(path)
      const onChange = (e: any) => {
        inputProps.onChange(e)
        // clear the error when changing the transfer amount
        setBuildTxError(undefined)
      }
      return { ...inputProps, onChange }
    },
    [form, setBuildTxError]
  )

  const buildTxCallback = useCallback(async () => {
    try {
      // we can not use the `form.validate()` because the `signatures` is invalid now,
      // and `validateField('destinations')` does not display error properly in the UI
      const hasError = form.values.destinations.some((_, index) => {
        const validateAddress = form.validateField(
          `destinations.${index}.address`
        )
        const validateAmount = form.validateField(
          `destinations.${index}.alphAmount`
        )
        return validateAddress.hasError || validateAmount.hasError
      })
      if (hasError) throw new Error('Invalid destinations')

      const buildTxResult = await buildMultisigTx(
        nodeProvider,
        form.values.multisig,
        form.values.signers,
        form.values.destinations
      )
      setBuildTxError(undefined)
      console.log(`Build multisig tx result: ${JSON.stringify(buildTxResult)}`)
      form.setValues({ unsignedTx: buildTxResult.unsignedTx, step: 1 })
    } catch (error) {
      setBuildTxError(`Error in build multisig tx: ${error}`)
      console.error(error)
    }
  }, [form])

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

  const selectedConfig = useMemo(() => {
    if (form.values.multisig === '') return undefined
    return allMultisig.find((c) => c.name === form.values.multisig)!
  }, [form.values.multisig, allMultisig])

  useEffect(() => {
    const storedValue = window.localStorage.getItem(newMultisigTxStorageKey)
    if (storedValue) {
      try {
        form.setValues(JSON.parse(storedValue))
      } catch (e) {
        console.log('Failed to parse stored value')
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      newMultisigTxStorageKey,
      JSON.stringify(form.values)
    )
  }, [form.values])

  const reset = useCallback(() => {
    form.reset()
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
                      Send Assets
                    </Text>
                    <Group mt="lg" position="apart" mx="0.5rem">
                      <TextInput
                        label="Recipient"
                        ta="left"
                        placeholder="Address"
                        icon={<IconAt />}
                        {...form.getInputProps('destinations.0.address')}
                        w="28rem"
                      />
                      <NumberInput
                        label="Alephium"
                        ta="left"
                        precision={6}
                        placeholder="Amount"
                        hideControls
                        rightSection="ALPH"
                        rightSectionWidth={'4rem'}
                        {...getInputPropsWithResetError(
                          'destinations.0.alphAmount'
                        )}
                      />
                    </Group>
                  </MyBox>
                  {buildTxError && (
                    <Text color="red" mt="lg" mx="lg">
                      {buildTxError}
                    </Text>
                  )}

                  <Group mt="lg" position="apart" mx="2rem">
                    <Button onClick={reset}>Reset</Button>
                    <Button onClick={buildTxCallback}>Build Transaction</Button>
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
              <CopyTextarea value={btoa(form.values.unsignedTx ?? '')} />
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
                    href={`${explorerUrl}/tx/${submitTxResult?.txId}`}
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

export default BuildMultisigTx
