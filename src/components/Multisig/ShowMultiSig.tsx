import { Code, Text } from "@mantine/core";
import { AllMultisigConfig, allMultisigStorageKey } from "./shared";

function ShowMultiSig() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const multisigName = urlParams.get('name')

  if (multisigName) {
    const allMultisigRaw = window.localStorage.getItem(allMultisigStorageKey)
    const allMultisig = (allMultisigRaw ? JSON.parse(allMultisigRaw) : undefined) as AllMultisigConfig
    const theMultisig = allMultisig.find(multisig => multisig.name === multisigName)

    if (theMultisig === undefined) {
      return <div>Cannot find multisig: "{multisigName}"</div>;
    } else {
      return <>
        <Text size="sm" weight={500} mt="md">
          Form values:
        </Text>
        <Code block>{JSON.stringify(theMultisig)}</Code>
      </>
    }
  } else {
    return <div>Please select the multisig</div>;
  }
}

export default ShowMultiSig;
