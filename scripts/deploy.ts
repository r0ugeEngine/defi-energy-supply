import { ethers, upgrades } from 'hardhat';
import { DOTCManager, SwarmDOTCEscrow, TokenListManager } from '../../typechain';
// import { readDeploymentFile } from '../common';
// import { deployContract } from '../helpers/deploy-contract';

// const DEPLOY_NFT_DOTC_MANAGER = false;

// ETHEREUM
const PermissionManagerProxy = '0xE214d97ba7fF83144699737f73D271C006013d91';
const XTokenWrapper = '0x2b9dc65253c035Eb21778cB3898eab5A0AdA0cCe';
let tokenListManager_address = '0x09E5A68c7800D85afA955Cf7d7c29133d07ad1Ef';
// POLYGON
// const PermissionManagerProxy = '0x2dDe22CbF81844492b5f29a2938ab075a8224Ef5';
// const XTokenWrapper = '0x6cDDe4eD9165405c1914b229d3cD4Ac9C354C331';
// let tokenListManager_address = undefined || '0xd37FE9cF730cBa5eAFc97ca112247c340991D27D';
// MUMBAI
// const PermissionManagerProxy = '0xE03331388a20dD77f370dfb2f8AbAe1474B02ea0';
// const XTokenWrapper = '0x9ED7C0Cd38a4A15A34A4093Fb1038ff867C9476B';
// let tokenListManager_address = undefined || '0x68b2fF6Ae01d907c276fff3369e909D4Fc04887f';

const DEPLOY_TOKENLIST_MANAGER = false;
const DEPLOY_DOTC_MANAGER = false;
const DEPLOY_ESCROW_MANAGER = false;
const DEPLOY_PROXY_ADMIN = true;

async function main() {
  // const { PermissionManagerProxy } = await readDeploymentFile();

  if (DEPLOY_TOKENLIST_MANAGER) {
    const TokenListManager = await ethers.getContractFactory('TokenListManager');
    const tokenListManager = (await TokenListManager.deploy()) as TokenListManager;
    await tokenListManager.deployed();

    tokenListManager_address = tokenListManager.address;

    console.log('TokenListManager: ', tokenListManager.address);
  }

  if (DEPLOY_DOTC_MANAGER) {
    if (tokenListManager_address == undefined || tokenListManager_address == '') {
      throw Error('Token list manager address not set');
    }

    const DOTCManager = await ethers.getContractFactory('DOTCManager');
    const dOTCManager = (await upgrades.deployProxy(DOTCManager, [
      tokenListManager_address,
      PermissionManagerProxy,
      XTokenWrapper,
    ])) as DOTCManager;

    await dOTCManager.deployed();

    console.log('DOTCManager: ', dOTCManager.address);
  }

  if (DEPLOY_ESCROW_MANAGER) {
    const SwarmDOTCEscrow = await ethers.getContractFactory('SwarmDOTCEscrow');
    const swarmDOTCEscrow: SwarmDOTCEscrow = await SwarmDOTCEscrow.deploy();
    await swarmDOTCEscrow.deployed();

    console.log('SwarmDOTCEscrow: ', swarmDOTCEscrow.address);
  }

  if (DEPLOY_PROXY_ADMIN) {
    const ProxyAdmin = await upgrades.deployProxyAdmin();

    console.log('ProxyAdmin: ', ProxyAdmin);
  }

  // if (DEPLOY_NFT_DOTC_MANAGER) {
  //   await deployContract<NFTDOTCManager>(
  //     'NFTDOTCManager',
  //     [tokenListManager.address, PermissionManagerProxy.address],
  //     NFTDOTCManagerArtifact.abi,
  //   );
  // }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
