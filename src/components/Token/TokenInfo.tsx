import { Box, Center, Stack, TextInput, rem } from '@mantine/core'
import { useCallback, useState } from 'react'
import { getTokenMetadata, useAlephium, useNetworkId } from '../../utils/utils'
import {
  FungibleTokenMetaData,
  addressFromTokenId,
  hexToString,
  prettifyTokenAmount,
} from '@alephium/web3'
import MyTable from '../Misc/MyTable'
import CopyText from '../Misc/CopyText'

type TokenInfo = FungibleTokenMetaData & {
  verified: boolean
  tokenId: string
  tokenAddress: string
}

function TokenInfo() {
  const [value, setValue] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>()
  const nodeProvider = useAlephium()
  const [network] = useNetworkId()

  const searchToken = useCallback(async (tokenId: string) => {
    setValue(tokenId)

    if (tokenId) {
      const tokenMetadata = await nodeProvider.fetchFungibleTokenMetaData(
        tokenId
      )
      const verified =
        network == 'devnet'
          ? false
          : getTokenMetadata(network).tokens.find(
              (token) => token.id === tokenId
            ) !== undefined
      const tokenAddress = addressFromTokenId(tokenId)
      setTokenInfo({ ...tokenMetadata, verified, tokenId, tokenAddress })
    } else {
      setTokenInfo(undefined)
    }
  }, [])

  return (
    <Center h={rem('80%')}>
      <Stack>
        <TextInput
          w={rem('40rem')}
          mx="auto"
          size="md"
          value={value}
          onChange={(event) => searchToken(event.currentTarget.value)}
          placeholder="Search token address or token id"
          radius="xl"
          withAsterisk
        />
        <Box mt={'xl'} w={rem('55rem')}>
          <MyTable
            data={{
              Verified: `${tokenInfo?.verified}`,
              Name: `${tokenInfo ? hexToString(tokenInfo.name) : undefined}`,
              Symbol: `${
                tokenInfo ? hexToString(tokenInfo.symbol) : undefined
              }`,
              Decimals: `${tokenInfo?.decimals}`,
              'Total Supply': `${
                tokenInfo
                  ? prettifyTokenAmount(
                      tokenInfo.totalSupply,
                      tokenInfo.decimals
                    )
                  : undefined
              }`,
              'Token ID': tokenInfo ? (
                <CopyText value={`${tokenInfo.tokenId}`} />
              ) : (
                'undefined'
              ),
              'Token Address': tokenInfo ? (
                <CopyText value={`${tokenInfo.tokenAddress}`} />
              ) : (
                'undefined'
              ),
            }}
          />
        </Box>
      </Stack>
    </Center>
  )
}

export default TokenInfo
