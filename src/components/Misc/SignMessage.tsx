import { useState } from 'react'
import { Button, Textarea, Text, Group, Stack, Title, Divider, TextInput, Alert } from '@mantine/core'
import { useWallet } from '@alephium/web3-react'
import { verifySignedMessage, addressFromPublicKey, KeyType } from '@alephium/web3'
import { NoWallet } from './NoWallet'
import CopyTextarea from './CopyTextarea'
import { IconCheck, IconX } from '@tabler/icons-react'

// All supported key types
const KEY_TYPES: KeyType[] = [
  'default',
  'bip340-schnorr',
  'gl-secp256k1',
  'gl-secp256r1',
  'gl-ed25519',
  'gl-webauthn'
]

function SignMessage() {
  const { account, connectionStatus, signer } = useWallet()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)

  // Verification state
  const [verifyMessage, setVerifyMessage] = useState('')
  const [verifySignature, setVerifySignature] = useState('')
  const [verifyPublicKey, setVerifyPublicKey] = useState('')
  const [verifyAddress, setVerifyAddress] = useState('')
  const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; message: string } | null>(null)

  if (connectionStatus === 'connecting' && !account) return null
  if (connectionStatus === 'disconnected') return <NoWallet />

  const handleSign = async () => {
    if (!signer || !account || !message.trim()) return
    setLoading(true)
    try {
      const result = await signer.signMessage({
        signerAddress: account.address,
        message: message.trim(),
        messageHasher: 'alephium',
      })
      setSignature(result.signature)
    } catch (error) {
      console.error('Error signing message:', error)
      alert('Failed to sign message')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = () => {
    setVerificationResult(null)

    if (!verifyMessage.trim() || !verifySignature.trim() || !verifyPublicKey.trim() || !verifyAddress.trim()) {
      setVerificationResult({
        isValid: false,
        message: 'Please fill in all required fields'
      })
      return
    }

    try {
      const targetAddress = verifyAddress.trim()
      const publicKey = verifyPublicKey.trim()

      // Try to find the correct key type by testing all possibilities
      let matchedKeyType: KeyType | null = null
      for (const keyType of KEY_TYPES) {
        try {
          const derivedAddress = addressFromPublicKey(publicKey, keyType)
          // Handle groupless addresses that might have explicit group index
          if (derivedAddress === targetAddress ||
              derivedAddress.split(':')[0] === targetAddress ||
              targetAddress.split(':')[0] === derivedAddress) {
            matchedKeyType = keyType
            break
          }
        } catch (e) {
          // This key type doesn't work, try next one
          continue
        }
      }

      if (!matchedKeyType) {
        // Try to show what addresses this public key could generate
        const possibleAddresses = KEY_TYPES.map(kt => {
          try {
            return addressFromPublicKey(publicKey, kt)
          } catch {
            return null
          }
        }).filter(Boolean)

        setVerificationResult({
          isValid: false,
          message: `Address mismatch: The public key doesn't correspond to ${targetAddress}. Possible addresses for this public key: ${possibleAddresses.join(', ')}`
        })
        return
      }

      // Verify the signature with the matched key type
      const isValid = verifySignedMessage(
        verifyMessage.trim(),
        'alephium',
        publicKey,
        verifySignature.trim(),
        matchedKeyType
      )

      if (isValid) {
        setVerificationResult({
          isValid: true,
          message: `✓ Valid signature from address: ${targetAddress} (key type: ${matchedKeyType})`
        })
      } else {
        setVerificationResult({
          isValid: false,
          message: '✗ Invalid signature - the signature does not match the message and public key'
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult({
        isValid: false,
        message: `Error during verification: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }

  return (
    <Stack align="center" mt="5%" w="100%" maw={800} mx="auto" p="md">
      <Title order={2}>Sign Message</Title>
      <Text>Enter a message to sign and prove address ownership.</Text>
      <Textarea
        placeholder="Enter your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        w="100%"
        minRows={4}
      />
      <Button onClick={handleSign} loading={loading} disabled={!message.trim()}>
        Sign Message
      </Button>
      {signature && (
        <Stack align="flex-start" w="100%">
          <Group position="apart" w="100%">
            <Text fw="bold">Signed Message:</Text>
            <CopyTextarea value={message.trim()} />
          </Group>
          <Group position="apart" w="100%">
            <Text fw="bold">Signer Address:</Text>
            <CopyTextarea value={account?.address || ''} />
          </Group>
          <Group position="apart" w="100%">
            <Text fw="bold">Public Key:</Text>
            <CopyTextarea value={account?.publicKey || ''} />
          </Group>
          <Group position="apart" w="100%">
            <Text fw="bold">Signature:</Text>
            <CopyTextarea value={signature} />
          </Group>
        </Stack>
      )}

      <Divider my="xl" w="100%" label="Verify Signed Message" labelPosition="center" />

      <Stack w="100%" spacing="md">
        <Title order={3}>Verify Message Signature</Title>
        <Text size="sm" c="dimmed">
          Verify that a message was signed by the owner of a specific address. You need both the address and public key of the signer (the public key is provided when signing a message).
        </Text>

        <Textarea
          label="Message"
          placeholder="The original message that was signed"
          value={verifyMessage}
          onChange={(e) => setVerifyMessage(e.target.value)}
          minRows={3}
        />

        <TextInput
          label="Address"
          placeholder="The address of the signer"
          value={verifyAddress}
          onChange={(e) => setVerifyAddress(e.target.value)}
          rightSection={
            account && (
              <Button
                size="xs"
                variant="subtle"
                onClick={() => setVerifyAddress(account.address)}
              >
                Use My Address
              </Button>
            )
          }
          rightSectionWidth={140}
        />

        <TextInput
          label="Public Key"
          placeholder="The public key of the signer (required, 66 characters hex)"
          value={verifyPublicKey}
          onChange={(e) => setVerifyPublicKey(e.target.value)}
          description="Note: Public keys cannot be derived from addresses. You need the public key from the signer."
          rightSection={
            account && (
              <Button
                size="xs"
                variant="subtle"
                onClick={() => setVerifyPublicKey(account.publicKey)}
              >
                Use My Key
              </Button>
            )
          }
          rightSectionWidth={120}
        />

        <Textarea
          label="Signature"
          placeholder="The signature to verify (128 characters hex)"
          value={verifySignature}
          onChange={(e) => setVerifySignature(e.target.value)}
          minRows={2}
        />

        <Button onClick={handleVerify}>
          Verify Signature
        </Button>

        {verificationResult && (
          <Alert
            icon={verificationResult.isValid ? <IconCheck size={16} /> : <IconX size={16} />}
            color={verificationResult.isValid ? 'green' : 'red'}
          >
            {verificationResult.message}
          </Alert>
        )}
      </Stack>
    </Stack>
  )
}

export default SignMessage