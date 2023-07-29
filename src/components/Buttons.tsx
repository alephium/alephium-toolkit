import { Button, Group } from "@mantine/core";
import { IconSun } from "@tabler/icons-react";
import { useState } from "react";

function Buttons() {
  const [loading, setLoading] = useState(false);
  const handleClick = () => {
    setLoading(!loading);
  };

  return (
    <div className="App">
      <Group position="center" spacing="md">
        <Button
          leftIcon={<IconSun />}
          variant="gradient"
          gradient={{ from: "indigo", to: "cyan" }}
          radius={0}
        >
          Indigo cyan
        </Button>
        <Button
          loading={loading}
          onClick={handleClick}
          variant="gradient"
          gradient={{ from: "teal", to: "lime", deg: 105 }}
        >
          Lime green
        </Button>
        <Button
          component="a"
          href="https://alephium.org"
          variant="gradient"
          gradient={{ from: "teal", to: "blue", deg: 60 }}
        >
          Teal blue
        </Button>
        <Button
          styles={() => ({
            root: {
              border: 0,
              paddingRight: 69,

              "&:hover": {
                paddingLeft: 69,
              },
            },
          })}
          variant="gradient"
          gradient={{ from: "orange", to: "red" }}
        >
          Orange red
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: "#ed6ea0", to: "#ec8c69", deg: 35 }}
        >
          Peach
        </Button>
      </Group>
    </div>
  );
}

export default Buttons;
