import {
  Group,
  TextInput,
  Box,
  Text,
  Button,
  Center,
  NumberInput,
  NumberInputHandlers,
  ActionIcon,
  rem,
  Slider,
  Tooltip,
} from '@mantine/core'
import { FORM_INDEX, useForm } from '@mantine/form'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { IconGripVertical, IconSquareRoundedMinus } from '@tabler/icons-react'
import { useEffect, useMemo, useRef } from 'react'
import MyBox from '../Misc/MyBox'
import {
  MultisigConfig,
  addMultisigConfig,
  buildMultisigAddress,
  defaultNewMultisig,
  isMultisigExists,
  isPubkeyValid,
  newMultisigStorageKey,
  resetNewMultisig,
} from './shared'
import { useNavigate } from 'react-router-dom'

function getPubkeyIndexByPath(path: string): number {
  const begin = path.indexOf('.')
  const end = path.lastIndexOf('.')
  return parseInt(path.slice(begin + 1, end))
}

function CreateMultisig() {
  const initialValues = useMemo(() => {
    const storedValue = window.localStorage.getItem(newMultisigStorageKey)
    if (storedValue) {
      try {
        return JSON.parse(storedValue) as MultisigConfig
      } catch (e) {
        console.log('Failed to parse stored value')
      }
    } 
    return defaultNewMultisig
  }, [])
  const form = useForm({
    validateInputOnChange: [`pubkeys.${FORM_INDEX}.pubkey`],
    initialValues: initialValues,
    validate: {
      name: (value) =>
        value === ''
          ? 'Empty name'
          : isMultisigExists(value)
          ? 'The multisig already exists'
          : null,
      pubkeys: {
        pubkey: (value, values, path) => {
          if (value === '') return 'Empty public key'
          if (!isPubkeyValid(value)) return 'Invalid public key'
          const index = values.pubkeys.findIndex((p) => p.pubkey === value)
          if (getPubkeyIndexByPath(path) !== index)
            return 'Duplicate public key'
          return null
        },
        name: (value, values, path) => {
          if (value === '') return 'Empty name'
          const index = values.pubkeys.findIndex((p) => p.name === value)
          if (getPubkeyIndexByPath(path) !== index) return 'Duplicate name'
          return null
        },
      },
    },
  })
  const handlers = useRef<NumberInputHandlers>()
  const navigate = useNavigate()

  useEffect(() => {
    window.localStorage.setItem(
      newMultisigStorageKey,
      JSON.stringify(form.values)
    )
  }, [form.values])

  useEffect(() => {
    if (form.values.pubkeys.length < form.values.mOfN) {
      form.setValues({ mOfN: form.values.pubkeys.length })
    }
  }, [form])

  const onSubmit = useMemo(() => {
    return form.onSubmit((values) => {
      const config = { ...values, address: buildMultisigAddress(values) }
      window.localStorage.setItem(newMultisigStorageKey, JSON.stringify(config))
      addMultisigConfig(config)
      resetNewMultisig()
      navigate('/multisig/show?name=' + values.name)
    })
  }, [form, navigate])

  console.log(`form.values`, form.values)

  const fields = form.values.pubkeys.map((_, index) => (
    <Draggable key={index} index={index} draggableId={index.toString()}>
      {(provided) => (
        <Group
          position="apart"
          spacing="xl"
          ref={provided.innerRef}
          mt="xs"
          {...provided.draggableProps}
        >
          <Center {...provided.dragHandleProps}>
            <IconGripVertical size="1.2rem" />
          </Center>
          <TextInput
            radius="md"
            placeholder="Name"
            ta="left"
            {...form.getInputProps(`pubkeys.${index}.name`)}
          />
          <TextInput
            radius="md"
            placeholder="Public Key"
            w="32rem"
            ta="left"
            {...form.getInputProps(`pubkeys.${index}.pubkey`)}
          />
          <Tooltip
            label="Remove Signer"
            disabled={form.values.pubkeys.length === 1}
          >
            <IconSquareRoundedMinus
              size="1.2rem"
              onClick={() =>
                form.values.pubkeys.length !== 1 &&
                form.removeListItem('pubkeys', index)
              }
            />
          </Tooltip>
        </Group>
      )}
    </Draggable>
  ))

  return (
    <Box maw={900} mx="auto" mt="5rem">
      <form onSubmit={onSubmit}>
        <Group position="center">
          <Text fw="700" size={'xl'}>
            Choose a Name
          </Text>
          <TextInput
            placeholder="Multisig Name"
            ta="left"
            size="md"
            {...form.getInputProps('name')}
          />
        </Group>

        <MyBox mt="2rem" px="2rem" py="1.5rem">
          <Text ta="left" fw="700">
            Signers
          </Text>
          <DragDropContext
            onDragEnd={({ destination, source }) =>
              form.reorderListItem('pubkeys', {
                from: source.index,
                to: destination!.index,
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
              radius={'md'}
              onClick={() => form.setValues(defaultNewMultisig)}
            >
              Reset Signers
            </Button>
            <Button
              variant="light"
              radius={'md'}
              onClick={() =>
                form.insertListItem('pubkeys', { name: '', pubkey: '' })
              }
            >
              Add Signer
            </Button>
          </Group>
        </MyBox>

        <MyBox mt="xl" px="2rem" py="1.5rem">
          <Text weight={700} ta="left">
            Signatures Required
          </Text>
          <Group position="apart">
            <Slider
              mt={rem('2.5rem')}
              w={'70%'}
              pb={'md'}
              px="md"
              min={0}
              max={form.values.pubkeys.length}
              step={1}
              value={form.values.mOfN}
              label={(val) => `${val} of ${form.values.pubkeys.length}`}
              labelAlwaysOn
              thumbSize={1}
              styles={(theme) => ({
                label: {
                  backgroundColor:
                    theme.colorScheme === 'dark'
                      ? theme.colors.dark[3]
                      : theme.colors.blue[3],
                },
              })}
            />
            <Group spacing={5} mt="md">
              <ActionIcon
                size={36}
                variant="default"
                onClick={() => handlers.current!.decrement()}
              >
                –
              </ActionIcon>

              <NumberInput
                hideControls
                value={form.values.mOfN}
                size={'xs'}
                onChange={(val) =>
                  form.setValues({ mOfN: val !== '' ? val : 1 })
                }
                handlersRef={handlers}
                max={form.values.pubkeys.length}
                min={1}
                step={1}
                styles={{ input: { width: rem(54), textAlign: 'center' } }}
              />

              <ActionIcon
                size={36}
                variant="default"
                onClick={() => handlers.current!.increment()}
              >
                +
              </ActionIcon>
            </Group>
          </Group>
        </MyBox>
        {/* </Group> */}

        <Group position="right" mt="xl" mx="lg">
          <Button type="submit">Create Multisig</Button>
        </Group>
      </form>
    </Box>
  )
}

export default CreateMultisig
