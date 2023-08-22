import { Deployer, DeployFunction } from '@alephium/cli'
import { SimpleToken } from '../artifacts/ts'

// Deploy the token template contract so that we could use it to issue new tokens
const deployTokenTemplate: DeployFunction = async (
  deployer: Deployer
): Promise<void> => {
  // Get settings
  const result = await deployer.deployContract(SimpleToken, {
    issueTokenAmount: 0n,
    // The initial states of the faucet contract
    initialFields: {
      symbol: Buffer.from('FT', 'utf8').toString('hex'),
      name: Buffer.from('Fake Token', 'utf8').toString('hex'),
      decimals: 18n,
      supply: 0n,
      balance: 0n,
      owner: deployer.account.address,
    },
  })
  console.log(
    'Token template contract id: ' + result.contractInstance.contractId
  )
  console.log(
    'Token template contract address: ' + result.contractInstance.address
  )
}

export default deployTokenTemplate
