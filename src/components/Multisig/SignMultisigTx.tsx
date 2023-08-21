import { Box, Button, Group, Text, Textarea } from "@mantine/core";

function SignMultisigTx() {
  return (
    <Box maw={900} mx="auto" mt="xl">
      <Text ta='left' fw="700">Multisig Transaction</Text>
      <Textarea
        placeholder="Paste your multisig transaction here"
        minRows={8}
        mt="md"
      />
      <Text ta='left' fw="700" mt="lg">TODO: Show Transaction Details</Text>
      <Group position="right" mt="lg">
        <Button color='indigo' onClick={() => {}}>
          Sign MultiSig Transaction
        </Button>
      </Group>
    </Box>
  );
}

export default SignMultisigTx;
