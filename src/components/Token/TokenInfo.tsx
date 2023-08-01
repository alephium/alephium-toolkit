import { Box, Center, Container, Stack, TextInput, rem } from '@mantine/core';
import { useCallback, useState } from 'react';
import { connectAlephium } from '../../utils/utils';
import { FungibleTokenMetaData, hexToString, prettifyTokenAmount } from '@alephium/web3';
import MyTable from '../Misc/MyTable';

function TokenInfo() {
  const [value, setValue] = useState('');
  const [tokenInfo, setTokenInfo] = useState<FungibleTokenMetaData>();

  const searchToken = useCallback(async (tokenAddress: string) => {
    setValue(tokenAddress)

    if (tokenAddress) {
      const nodeProvider = connectAlephium("mainnet")
      const tokenMetadata = await nodeProvider.fetchFungibleTokenMetaData(tokenAddress)
      setTokenInfo(tokenMetadata)
    } else {
      setTokenInfo(undefined)
    }
  }, [])

  return (
    <Center h={rem("80%")}>
      <Stack>
      <TextInput
        w={rem("40rem")}
        mx="auto"
        value={value}
        onChange={(event) => searchToken(event.currentTarget.value)}
        placeholder="Search token address or token id"
        radius="xl"
        withAsterisk
      />
      <Box mt={rem("10%")} w={rem("50rem")}>
        <MyTable data={{
          "Name": `${tokenInfo ? hexToString(tokenInfo.name) : undefined}`,
          "Symbol": `${tokenInfo ? hexToString(tokenInfo.symbol) : undefined}`,
          "Decimals": `${tokenInfo?.decimals}`,
          "Total Supply": `${tokenInfo ? prettifyTokenAmount(tokenInfo.totalSupply, tokenInfo.decimals) : undefined}`,
        }} />
      </Box>
    </Stack>
    </Center>
  );
}

export default TokenInfo;
