import { ethers } from 'hardhat';

async function main() {
  const NRGS = await ethers.getContractFactory('NRGS');
  const nrgs = await NRGS.deploy();
  await nrgs.deployed();

  console.log(`NRGS deployed to ${nrgs.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
