import { Button, CopyButton, Tooltip } from "@mantine/core"

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
          <Button w="100%" variant="light" onClick={copy} styles={{
            root: {
              height: 'auto',
              padding: '0.5rem'
            },
            inner: {
              height: 'auto',
            },
            label: {
              whiteSpace: 'normal',
              wordBreak: 'break-all',
              height: 'auto',
            }
          }}>
            {value}
          </Button>
        </Tooltip.Floating>
      )}
    </CopyButton>
  )
}

export default CopyTextarea
