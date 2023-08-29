import { Button, CopyButton, MantineColor, Tooltip } from '@mantine/core'

interface CopyTextareaProps {
  value: string
  color?: MantineColor
}

function CopyTextarea({ value, color }: CopyTextareaProps) {
  return (
    <CopyButton value={value} timeout={1000}>
      {({ copied, copy }) => (
        <Tooltip.Floating label={copied ? 'Copied' : 'Copy'} position="right">
          <Button
            variant="subtle"
            color={color}
            onClick={copy}
            styles={{
              root: {
                height: 'auto',
                padding: '0.5rem',
              },
              label: {
                whiteSpace: 'normal',
                wordBreak: 'break-all',
                lineHeight: '1.5rem',
              },
            }}
          >
            {value}
          </Button>
        </Tooltip.Floating>
      )}
    </CopyButton>
  )
}

export default CopyTextarea
