import { Box, Button, Chip, Code, Grid, Group, Input, NumberInput, SimpleGrid, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { IconAt } from "@tabler/icons-react";
import { useState } from "react";
import MyBox from "../Misc/MyBox";
import { useForm } from "@mantine/form";
import { Number256 } from "@alephium/web3";

const testData = {"name":"FooDAO","pubkeys":[{"name":"Alice","pubkey":"A"},{"name":"Bob","pubkey":"B"},{"name":"Charlie","pubkey":"C"}],"mOfN":2, "address": "???"}

function BuildMultisigTx() {
  const form = useForm<{ signers: string[], destinations: { address: string, attoAlphAmount: Number256 }[]}>({
    initialValues: {
      signers: [],
      destinations: []
    },
  });

  return (
    <Box maw={900} mx="auto" mt="xl">
      <Grid>
      <Grid.Col span={8}>
      <Stack>
      <MyBox mx="xl">
      <Text ta='left' fw="700">Select {testData.mOfN} Signers</Text>
      <Chip.Group multiple onChange={signers => form.setValues({ signers: signers })}>
        <Group position="center" mt="lg">
        {...testData.pubkeys.map((signer) => (
          <Chip
            value={signer.pubkey}
            variant="light"
            radius="xl"
            disabled={form.values.signers.length >= testData.mOfN && !form.values.signers.includes(signer.pubkey)}
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
        <TextInput label="Recipient" ta="left" placeholder="Address" icon={<IconAt/>} />
        <NumberInput label="Alephium" ta="left" placeholder="Amount" hideControls rightSection="ALPH" rightSectionWidth={"4rem"}/>
      </Group>

        </MyBox>

      <Group mt="lg" position="apart" mx="2rem">
        <Button color='indigo' onClick={() => {}}>
          Reset
        </Button>
        <Button color='indigo' onClick={() => {}}>
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
      />
      </Stack>

    </Grid.Col>
    </Grid>
    </Box>
  );
}

export default BuildMultisigTx;
