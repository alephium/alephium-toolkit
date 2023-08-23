import { CopyButton, Textarea, Tooltip, UnstyledButton } from "@mantine/core"

interface CopyTextareaProps {
  value: string
}

function CopyTextarea({ value }: CopyTextareaProps) {
  return (
    <CopyButton
      value={value}
      timeout={1000}
    >
      {({ copied, copy }) => (
        <Tooltip.Floating
          label={copied ? 'Copied' : 'Copy'}
          position='right'
        >
          <UnstyledButton w="100%" onClick={copy}>
            <Textarea
              placeholder="Paste your configuration here"
              value={value}
              minRows={1}
              mt="md"
              autosize
              disabled
              styles={(theme) => ({
                input: {
                  ':disabled': {
                    backgroundColor: 'white',
                    color: theme.primaryColor,
                  },
                },
              })}
            />
          </UnstyledButton>
        </Tooltip.Floating>
      )}
    </CopyButton>
  )
}

export default CopyTextarea
