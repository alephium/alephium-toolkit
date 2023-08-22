import { Box, Button, Chip, Code, Grid, Group, Input, NumberInput, Select, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { IconAt } from "@tabler/icons-react";
import { useCallback, useMemo, useState } from "react";
import MyBox from "../Misc/MyBox";
import { FORM_INDEX, useForm } from "@mantine/form";
import { NodeProvider, convertAlphAmountWithDecimals, isBase58, node, web3 } from "@alephium/web3";
import { buildMultisigTx, useAllMultisig } from "./shared";

const testData = {"name":"FooDAO","pubkeys":[{"name":"Alice","pubkey":"A"},{"name":"Bob","pubkey":"B"},{"name":"Charlie","pubkey":"C"}],"mOfN":2, "address": "???"}

function BuildMultisigTx() {
  const form = useForm<{ multisig: string, signers: string[], destinations: { address: string, alphAmount: string }[]}>({
    validateInputOnChange: [`destinations.${FORM_INDEX}.address`, `destinations.${FORM_INDEX}.alphAmount`],
    initialValues: {
      multisig: '',
      signers: [],
      destinations: [{ address: '', alphAmount: '' }]
    },
    validate: {
      multisig: (value) => value === '' ? 'Please select multisig' : null,
      destinations: {
        address: (value) => value === '' ? 'Empty address' : !isBase58(value) ? 'Invalid address' : null,
        alphAmount: (value) => {
          if (value === '') return 'Empty amount'
          const amount = convertAlphAmountWithDecimals(value)
          return amount === undefined || amount <= 0n ? 'Invalid amount' : null
        }
      }
    }
  });
  const allMultisig = useAllMultisig()

  const [buildTxResult, setBuildTxResult] = useState<node.BuildTransactionResult | undefined>()

  const buildTxCallback = useCallback(async () => {
    try {
      const { hasErrors, errors } = form.validate()
      if (hasErrors) throw errors
      // const nodeProvider = web3.getCurrentNodeProvider()
      const nodeProvider = new NodeProvider('http://127.0.0.1:22973')
      const buildTxResult = await buildMultisigTx(nodeProvider, form.values.multisig, form.values.signers, form.values.destinations)
      console.log(`Result: ${JSON.stringify(buildTxResult)}`)
      setBuildTxResult(buildTxResult)
    } catch (error) {
      console.error(error)
    }
  }, [form, setBuildTxResult])

  const selectedConfig = useMemo(() => {
    if (form.values.multisig === '') return testData
    return allMultisig.find((c) => c.name === form.values.multisig)!
  }, [form.values.multisig, allMultisig])

  return (
    <Box maw={900} mx="auto" mt="xl" ta="left">
      <Select
        w={"20rem"}
        mx="auto"
        placeholder="Select Multisig"
        data={allMultisig.map(multisig => ({ value: multisig.name, label: multisig.name }))}
        onChange={value => form.setValues({ multisig: value ?? '' })}
      />
      <Grid mt="lg">
      <Grid.Col span={8}>
      <Stack>
      <MyBox mx="xl">
      <Text ta='left' fw="700">Select {selectedConfig.mOfN} Signers</Text>
      <Chip.Group multiple onChange={signers => form.setValues({ signers: signers })}>
        <Group position="center" mt="lg">
        {...selectedConfig.pubkeys.map((signer) => (
          <Chip
            value={signer.pubkey}
            variant="light"
            radius="xl"
            disabled={form.values.signers.length >= selectedConfig.mOfN && !form.values.signers.includes(signer.pubkey)}
            style={{ marginRight: "0.5rem", marginBottom: "0.5rem" }}
          >
            {signer.name}
          </Chip>
        ))}
        </Group>
      </Chip.Group>
      </MyBox>

    {/* <Code block>{JSON.stringify(selected.sort((pubkey0, pubkey1) => {
      const index0 = testData.pubkeys.findIndex(obj => obj.pubkey === pubkey0)
      const index1 = testData.pubkeys.findIndex(obj => obj.pubkey === pubkey1)
      console.log(index0, index1)
      return index0 - index1
    }))}</Code> */}

      <MyBox mx="xl">
      <Text ta='left' fw="700">Send Assets</Text>
      <Group mt="lg" position="apart" mx="0.5rem">
        <TextInput label="Recipient" ta="left" placeholder="Address" icon={<IconAt/>} {...form.getInputProps('destinations.0.address')} />
        <NumberInput
          label="Alephium"
          ta="left"
          precision={6}
          placeholder="Amount"
          hideControls rightSection="ALPH"
          rightSectionWidth={"4rem"}
          {...form.getInputProps('destinations.0.alphAmount')}
        />
      </Group>

        </MyBox>

      <Group mt="lg" position="apart" mx="2rem">
        <Button color='indigo' onClick={() => {}}>
          Reset
        </Button>
        <Button color='indigo' onClick={buildTxCallback}>
          Build Transaction
        </Button>
      </Group>
      </Stack>

    </Grid.Col>

    <Grid.Col span={4}>
      <Stack h="100%" justify="center">
      <Text ta='left' fw="700">Transaction</Text>
      <Textarea
        placeholder="The built transaction will appear here"
        minRows={8}
        disabled
        value={buildTxResult?.unsignedTx}
      />
      </Stack>

    </Grid.Col>
    </Grid>
    </Box>
  );
}

export default BuildMultisigTx;
