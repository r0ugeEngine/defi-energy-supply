import { ethers } from 'hardhat';

async function main() {
  const MCGR = await ethers.getContractFactory('MCGR');
  const mcgr = await MCGR.deploy();
  await mcgr.deployed();

  console.log(`ELU deployed to ${mcgr.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
