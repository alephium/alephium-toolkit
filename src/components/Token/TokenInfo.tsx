import { Box, Center, Stack, TextInput, rem } from '@mantine/core'
import { useCallback, useState } from 'react'
import { getTokenMetadata, useAlephium, useExplorer, useNetworkId } from '../../utils/utils'
import {
  FungibleTokenMetaData,
  addressFromTokenId,
  groupOfAddress,
  hexToString,
  prettifyTokenAmount,
  codec,
  ExplorerProvider,
  Address,
} from '@alephium/web3'
import MyTable from '../Misc/MyTable'
import CopyText from '../Misc/CopyText'
import { Buffer } from 'buffer'

function isContractUpgradable(contract: codec.contract.Contract): boolean {
  return contract.methods.some((method) =>
    method.instrs.some((instr) => {
      return instr.code === codec.MigrateSimple.code || instr.code === codec.MigrateWithFields.code
  }))
}

function isContractDestroyable(contract: codec.contract.Contract): boolean {
  return contract.methods.some((method) => {
    return method.instrs.some((instr) => instr.code === codec.DestroySelf.code)
  })
}

async function isAdditionalTokenIssuanceAllowed(
  explorerProvider: ExplorerProvider,
  contract: codec.contract.Contract,
  address: Address,
): Promise<boolean> {
  const result = await explorerProvider.contracts.getContractsContractAddressParent(address)
  return result.parent !== undefined && isContractDestroyable(contract)
}

type TokenInfo = FungibleTokenMetaData & {
  verified: boolean
  tokenId: string
  tokenAddress: string
  upgradable: boolean
  destroyable: boolean
  additionalIssuanceAllowed: boolean
}

function TokenInfo() {
  const [value, setValue] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>()
  const nodeProvider = useAlephium()
  const explorerProvider = useExplorer()
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
      const group = groupOfAddress(tokenAddress)
      const contractState = await nodeProvider.contracts.getContractsAddressState(tokenAddress, { group })
      const contract = codec.contract.contractCodec.decodeContract(Buffer.from(contractState.bytecode, 'hex'))
      const upgradable = isContractUpgradable(contract)
      const destroyable = isContractDestroyable(contract)
      const additionalIssuanceAllowed = await isAdditionalTokenIssuanceAllowed(explorerProvider, contract, tokenAddress)
      setTokenInfo({ ...tokenMetadata, verified, tokenId, tokenAddress, upgradable, destroyable, additionalIssuanceAllowed })
    } else {
      setTokenInfo(undefined)
    }
  }, [])

  return (
    <Center mt={"xl"}>
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
              'Token Contract Upgradable': `${tokenInfo?.upgradable}`,
              'Token Contract Destroyable': `${tokenInfo?.destroyable}`,
              // 'Additional Issuance Allowed': `${tokenInfo?.additionalIssuanceAllowed}`
            }}
          />
        </Box>
      </Stack>
    </Center>
  )
}

export default TokenInfo
