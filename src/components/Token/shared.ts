import { DeployNewToken } from '../../../artifacts/ts'
import { loadDeployments } from '../../../artifacts/ts/deployments'
import { NetworkId, ONE_ALPH, SignerProvider } from '@alephium/web3'
import { Buffer } from 'buffer'

export async function deployNewToken(
  network: NetworkId,
  signer: SignerProvider,
  {
    name,
    symbol,
    decimals,
    supply,
  }: { name: string; symbol: string; decimals: number; supply: number }
): Promise<string> {
  const deployments = loadDeployments(network)
  const result = await DeployNewToken.execute(signer, {
    initialFields: {
      templateId: deployments.contracts.SimpleToken.contractInstance.contractId,
      name: Buffer.from(name, 'utf-8').toString('hex'),
      symbol: Buffer.from(symbol, 'utf-8').toString('hex'),
      decimals: BigInt(decimals),
      initialSupply: BigInt(supply) * BigInt(10 ** decimals),
    },
    attoAlphAmount: ONE_ALPH,
  })
  console.log(result)
  return result.txId
}
