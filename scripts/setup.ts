import hre, { ethers } from 'hardhat';
import { DOTCManager, PermissionManagerV2, SwarmDOTCEscrow, TokenListManager } from 'typechain';

const feeCollector = '0x4736725fdD5F58C4aca74426042442e71CB97ef1';

// MUMBAI
// const TokenListManagerAddress = '0x68b2fF6Ae01d907c276fff3369e909D4Fc04887f';
// const DOTCManagerAddress = '0x0a325407737Ca269A817252e63519CCa0E3CcA94';
// const SwarmDOTCEscrowAddress = '0x340b5301CA73a96f31Fa292E0732afC6bAF0757a';
// const PermissionManagerProxyAddress = '0xE03331388a20dD77f370dfb2f8AbAe1474B02ea0';

// POLYGON
// const TokenListManagerAddress = '0xd37FE9cF730cBa5eAFc97ca112247c340991D27D';
// const DOTCManagerAddress = '0x667E3A192e5b7D02a7794CD11014adC1e24f96f9';
// const SwarmDOTCEscrowAddress = '0xd3BB542dBd97aE85AE09048742C9089158254121';
// const PermissionManagerProxyAddress = '0x2dDe22CbF81844492b5f29a2938ab075a8224Ef5';

// MAINNET
const TokenListManagerAddress = '0x09e5a68c7800d85afa955cf7d7c29133d07ad1ef';
const DOTCManagerAddress = '0x73AcB24A37340CC82e07DB1293FEa4FD5afa7a4a';
const SwarmDOTCEscrowAddress = '0xb176f411ff4f4a74deb0ab03379c8af49be91d3e';
const PermissionManagerProxyAddress = '0xE214d97ba7fF83144699737f73D271C006013d91';

const ESCROW_SETUP = true;
const TOKEN_MANAGER_SETUP = false;
const DOTC_SETUP = true;

//const IS_MAINNET_DEPLOYMENT = false;

// const DEPLOY_NFT_DOTC_MANAGER = false;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer: ', deployer.address);

  // const { SwarmDOTCEscrow, DOTCManager, TokenListManager, NFTDOTCManager, SMT, WETH, USDC, WBTC, DAI } =
  //   await readDeploymentFile();

  const tokenManager: TokenListManager = await ethers.getContractAt('TokenListManager', TokenListManagerAddress);

  const dotcManager: DOTCManager = await ethers.getContractAt('DOTCManager', DOTCManagerAddress);

  const escrow: SwarmDOTCEscrow = await ethers.getContractAt('SwarmDOTCEscrow', SwarmDOTCEscrowAddress);

  const pmv2: PermissionManagerV2 = await ethers.getContractAt('PermissionManagerV2', PermissionManagerProxyAddress);

  // let nftDOtcManager;
  // if (NFTDOTCManager?.address) {
  //   nftDOtcManager = new NftDotcManagerHelper();
  //   await nftDOtcManager.useDeployedContract(NFTDOTCManager.address);
  // }

  const escrowManagerRole = await dotcManager.ESCROW_MANAGER_ROLE();
  const feeManagerRole = await dotcManager.FEE_MANAGER_ROLE();
  const dotcAdminManagerRole = await dotcManager.dOTC_Admin_ROLE();
  const perissionSetterManagerRole = await dotcManager.PERMISSION_SETTER_ROLE();

  if (TOKEN_MANAGER_SETUP) {
    console.log('Token manager grants TOKEN_MANAGER_ROLE to deployer');
    await tokenManager.setRegistryManager(deployer.address);
    console.log(`....Role granted`);
  }

  if (ESCROW_SETUP) {
    console.log('Escrow manager grants EscrowManager role to deployer');
    await escrow.setEscrowManager(DOTCManagerAddress);
    console.log(`....Role granted`);
  }

  if (DOTC_SETUP) {
    console.log('dOTC manager grants roles to deployer');
    await dotcManager.grantRole(escrowManagerRole, deployer.address);
    await dotcManager.grantRole(feeManagerRole, deployer.address);
    await dotcManager.grantRole(dotcAdminManagerRole, deployer.address);
    await dotcManager.grantRole(perissionSetterManagerRole, deployer.address);
    console.log(`....Role granted`);

    console.log('Inititalization in dOTC');
    await dotcManager.setEscrowAddress(SwarmDOTCEscrowAddress);
    await dotcManager.setFeeAddress(feeCollector);
    await dotcManager.setEscrowLinker();
    console.log(`....Inititalized`);

    console.log('Assign tier2 to the contracts');
    await pmv2.assignSingleItem(2, DOTCManagerAddress);
    await pmv2.assignSingleItem(2, SwarmDOTCEscrowAddress);
    console.log(`....Assigned`);
  }
  // await nftDOtcManager?.grantNftEscrowManagerRole(deployer.address);

  // if (IS_MAINNET_DEPLOYMENT) {
  //   await dotcManager.grantDotcAdminRole(swarmManager[0]);
  //   await dotcManager.grantDotcAdminRole(swarmManager[1]);
  //   await dotcManager.grantPermissionSetterRole(swarmManager[0]);
  //   await dotcManager.grantPermissionSetterRole(swarmManager[1]);
  //   await dotcManager.grantEscrowManagerRole(swarmManager[0]);
  //   await dotcManager.grantEscrowManagerRole(swarmManager[1]);
  //   await dotcManager.grantFeeManagerRole(swarmManager[0]);
  //   await dotcManager.grantFeeManagerRole(swarmManager[1]);

  //   await nftDOtcManager?.grantNftEscrowManagerRole(swarmManager[0]);
  //   await nftDOtcManager?.grantNftEscrowManagerRole(swarmManager[1]);
  // }

  // if (DEPLOY_NFT_DOTC_MANAGER && nftDOtcManager) {
  //   await escrow.setNFTEscrowManager(nftDOtcManager.address);
  // }

  // startLog('Running initialization');

  // await nftDOtcManager?.setNftEscrowAddress(escrow.address);
  // await nftDOtcManager?.setNftEscrowLinker();
  // stopLog(`....Contract Initialized`);

  // if (IS_MAINNET_DEPLOYMENT) {
  //   await tokenManager.grantDefaultAdminRole(swarmManager[1]);
  //   await dotcManager.grantDefaultAdminRole(swarmManager[1]);
  //   await escrow.grantDefaultAdminRole(swarmManager[1]);
  //   await nftDOtcManager?.grantDefaultAdminRole(swarmManager[1]);

  //   await dotcManager.revokeEscrowManagerRole(deployer.address);
  //   await dotcManager.revokeDotcAdminRole(deployer.address);
  //   await dotcManager.revokeFeeManagerRole(deployer.address);
  //   await nftDOtcManager?.revokeNftEscrowManagerRole(deployer.address);

  //   await tokenManager.revokeDefaultAdminRole(deployer.address);
  //   await dotcManager.revokeDefaultAdminRole(deployer.address);
  //   await escrow.revokeDefaultAdminRole(deployer.address);
  //   await nftDOtcManager?.revokeDefaultAdminRole(deployer.address);
  // }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
