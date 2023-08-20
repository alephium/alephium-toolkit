import { Box, Button, Group, Text, Textarea } from "@mantine/core";

function ImportMultisig() {
  return (
    <Box maw={900} mx="auto" mt="xl">
      <Text ta='left' fw="700">Multisig configuration</Text>
      <Textarea
        placeholder="Paste your configuration here"
        minRows={8}
        mt="md"
      />
      <Group position="right" mt="lg">
        <Button color='indigo' onClick={() => {}}>
          Import Multisig
        </Button>
      </Group>
    </Box>
  );
}

export default ImportMultisig;
