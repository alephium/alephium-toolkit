import { useState } from 'react'
import { Button, Textarea, Text, Group, Stack, Title } from '@mantine/core'
import { useWallet } from '@alephium/web3-react'
import { NoWallet } from './NoWallet'
import CopyTextarea from './CopyTextarea'

function SignMessage() {
  const { account, connectionStatus, signer } = useWallet()
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)

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

  return (
    <Stack align="center" mt="10%">
      <Title order={2}>Sign Message</Title>
      <Text>Enter a message to sign and prove address ownership.</Text>
      <Textarea
        placeholder="Enter your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        w={600}
        minRows={4}
      />
      <Button onClick={handleSign} loading={loading} disabled={!message.trim()}>
        Sign Message
      </Button>
      {signature && (
        <Stack align="flex-start">
          <Group position="apart">
            <Text fw="bold">Signed Message:</Text>
            <CopyTextarea value={message.trim()} />
          </Group>
          <Group position="apart">
            <Text fw="bold">Signer Address:</Text>
            <CopyTextarea value={account?.address || ''} />
          </Group>
          <Group position="apart">
            <Text fw="bold">Signature (Hash):</Text>
            <CopyTextarea value={signature} />
          </Group>
        </Stack>
      )}
    </Stack>
  )
}

export default SignMessage