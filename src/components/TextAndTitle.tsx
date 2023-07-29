import { Text, Title } from "@mantine/core";

function TextAndTitleExample() {
  return (
    <div>
      <Title order={2}> THIS is a big O title</Title>
      <Text size="lg" weight={700} underline transform="capitalize">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt nulla
        quam aut sed corporis voluptates praesentium inventore, sapiente ex
        tempore sit consequatur debitis non! Illo cum ipsa reiciendis quidem
        facere, 
        <Text variant="gradient" gradient={{from: "red", to: "blue", deg: 138}} size="xl">
        deserunt eos totam impedit. 
        </Text>
        Vel ab, ipsum veniam aperiam odit
        molestiae incidunt minus, sint eos iusto earum quaerat vitae
        perspiciatis.
      </Text>
    </div>
  );
}

export default TextAndTitleExample;
