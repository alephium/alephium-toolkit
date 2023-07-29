import { TextInput } from "@mantine/core";
import { IconBrandGithub, IconBrandNotion } from "@tabler/icons-react";

function InputExample() {
  return <div>
    <TextInput
    radius={"lg"}
    icon={<IconBrandGithub />}
    rightSection={<IconBrandNotion />}
    label="This is the best input field"
    description="No This is the best input field"
    placeholder="Type something..." />
    required
  </div>
}

export default InputExample;
