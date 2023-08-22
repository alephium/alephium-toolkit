import { Box, Button, Group, Text, Textarea } from "@mantine/core";
import { useCallback, useState } from "react";
import CopyText from "../Misc/CopyText";
import { useWallet } from "@alephium/web3-react";
import { signMultisigTx } from "./shared";

function SignMultisigTx() {
  const [signature, setSignature] = useState<{ signer: string, signature: string } | undefined>()
  const [unsignedTx, setUnsignedTx] = useState<string | undefined>()
  const wallet = useWallet()

  const sign = useCallback(async () => {
    if (wallet && unsignedTx) {
      const signature = await signMultisigTx(wallet.signer, unsignedTx)
      setSignature(signature)
    }
  }, [wallet, unsignedTx, setSignature])

  return (
    <Box maw={900} mx="auto" mt="xl">
      <Text ta='left' fw="700">Multisig Transaction</Text>
      <Textarea
        placeholder="Paste your multisig transaction here"
        minRows={8}
        mt="md"
        onChange={(e) => {
          if (e.target.value === '') {
            setUnsignedTx(undefined)
          } else {
            setUnsignedTx(e.target.value)
          }
        }}
      />
      <Text ta='left' fw="700" mt="lg">TODO: Show Transaction Details</Text>

      {
        signature
        ? <Group>
          <Text>Signature: </Text>
          <CopyText value={signature.signature} />
        </Group>
        : <Group position="right" mt="lg">
          <Button color='indigo' onClick={sign}>
            Sign MultiSig Transaction
          </Button>
        </Group>
      }
    </Box>
  );
}

export default SignMultisigTx;
