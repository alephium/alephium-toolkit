import { Chip, Group } from "@mantine/core";
import { useEffect, useState } from "react";

function ChipsExample() {
  const [value, setValue] = useState(["react"]);

  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <Chip.Group multiple value={value} onChange={setValue}>
      <Group position="center" mt="md" color="red" variant="filled">
        <Chip color="red" radius={"sm"} value="react">React</Chip>
        <Chip value="ng">Angular</Chip>
        <Chip value="svelte">Svelte</Chip>
        <Chip value="vue">Vue</Chip>
      </Group>
    </Chip.Group>
  );
}

export default ChipsExample;
