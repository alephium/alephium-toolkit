import { Box } from "@mantine/core";

function MyBox({ children }: { children: React.ReactNode }) {
  return (
    <Box
      mx="auto"
      px="1.5rem"
      py="2rem"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[7]
            : "white",
        borderRadius: theme.radius.md,
        boxShadow: theme.shadows.md,
      })}
    >
      {children}
    </Box>
  );
}

export default MyBox;
