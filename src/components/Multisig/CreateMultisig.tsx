import { Group, TextInput, Box, Text, Code, Button, Center, NumberInput, NumberInputHandlers, ActionIcon, rem, Slider, Divider, Space, Stack, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { IconGripVertical, IconSquareRoundedMinus } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import MyBox from '../Misc/MyBox';
import { allMultisigStorageKey, defaultNewMultisig, newMultisigStorageKey } from './shared';
import { useNavigate } from 'react-router-dom';

function CreateMultisig() {
  const form = useForm({
    initialValues: defaultNewMultisig,
  });
  const handlers = useRef<NumberInputHandlers>()
  const navigate = useNavigate()

  useEffect(() => {
    const storedValue = window.localStorage.getItem(newMultisigStorageKey);
    if (storedValue) {
      try {
        form.setValues(JSON.parse(storedValue));
      } catch (e) {
        console.log('Failed to parse stored value');
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(newMultisigStorageKey, JSON.stringify(form.values));
  }, [form.values]);

  const fields = form.values.pubkeys.map((_, index) => (
    <Draggable key={index} index={index} draggableId={index.toString()}>
      {(provided) => (
        <Group position="apart" ref={provided.innerRef} mt="xs" {...provided.draggableProps}>
          <Center {...provided.dragHandleProps}>
            <IconGripVertical size="1.2rem" />
          </Center>
          <TextInput radius="md" placeholder="Name" {...form.getInputProps(`pubkeys.${index}.name`)} />
          <TextInput
            radius="md"
            placeholder="Public Key"
            w="32rem"
            {...form.getInputProps(`pubkeys.${index}.pubkey`)}
          />
          <Tooltip label="Remove Signer">
            <IconSquareRoundedMinus
              size="1.2rem"
              onClick={() => form.removeListItem('pubkeys', index)}
            />
          </Tooltip>
        </Group>
      )}
    </Draggable>
  ));

  return (
    <Box maw={900} mx="auto" mt="xl">
      <Group position="center" mb="xl">
        <Text>Choose a Name:</Text>
        <TextInput placeholder="Multisig Name" {...form.getInputProps('name')} />
      </Group>

      <MyBox>
        <Text ta='left' fw="700">Signers</Text>
      <DragDropContext
        onDragEnd={({ destination, source }) =>
          form.reorderListItem("pubkeys", {
            from: source.index,
            to: destination.index,
          })
        }
      >
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {fields}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Group position="apart" mt="lg">
        <Button
          variant="light"
          radius={"md"}
          onClick={() => form.reset()}
        >
          Reset Signers
        </Button>
        <Button
          variant="light"
          radius={"md"}
          onClick={() => form.insertListItem("pubkeys", { name: "", pubkey: "" })}
        >
          Add Signer
        </Button>
      </Group>
      </MyBox>

      <Space h="lg" />
      <MyBox>
        <Text weight={700} ta="left">Signatures Required</Text>
      <Group position="apart">
        <Slider
          mt={rem("2.5rem")}
          w={"70%"}
          pb={"md"}
          px="md"
          min={1}
          max={form.values.pubkeys.length}
          step={1}
          value={form.values.mOfN}
          label={(val) => `${val} of ${form.values.pubkeys.length}`}
          labelAlwaysOn
          thumbSize={1}
          styles={(theme) =>({
            label: {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.blue[3],
            }
          })}
        />
        <Group spacing={5} mt="md">
          <ActionIcon
            size={42}
            variant="default"
            onClick={() => handlers.current.decrement()}
          >
            –
          </ActionIcon>

          <NumberInput
            hideControls
            value={form.values.mOfN}
            onChange={(val) => form.setValues({ mOfN: val !== "" ? val : 1 })}
            handlersRef={handlers}
            max={form.values.pubkeys.length}
            min={1}
            step={1}
            styles={{ input: { width: rem(54), textAlign: "center" } }}
          />

          <ActionIcon
            size={42}
            variant="default"
            onClick={() => handlers.current.increment()}
          >
            +
          </ActionIcon>
        </Group>
      </Group>
      </MyBox>
      {/* </Group> */}

      <Group position="right" mt="lg">
        <Button color='indigo' onClick={() => {
          const existingMultisigs = window.localStorage.getItem(allMultisigStorageKey)
          if (existingMultisigs) {
            const parsed = JSON.parse(existingMultisigs)
            window.localStorage.setItem(allMultisigStorageKey, JSON.stringify([...parsed, form.values]))
          } else {
            window.localStorage.setItem(allMultisigStorageKey, JSON.stringify([form.values]))
          }
          navigate('/multisig/show?name=' + form.values.name)
        }}>
          Create Multisig
        </Button>
      </Group>

      {/* <Text size="sm" weight={500} mt="md">
        Form values:
      </Text>
      <Code block>{JSON.stringify(window.localStorage.getItem(allMultisigStorageKey), null, 2)}</Code> */}
    </Box>
  );
}

export default CreateMultisig;
