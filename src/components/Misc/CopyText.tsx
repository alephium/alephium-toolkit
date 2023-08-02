import { Button, CopyButton, Tooltip } from "@mantine/core";

function CopyText({ value }: { value: string }) {
  return (
    <CopyButton value={value} timeout={1000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right" color="indigo">
          <Button variant='subtle' onClick={copy}>{value}</Button>
        </Tooltip>
      )}
    </CopyButton>
  )
}

export default CopyText;
