import { ethers } from 'hardhat';

async function main() {
  const ELU = await ethers.getContractFactory('ELU');
  const elu = await ELU.deploy();
  await elu.deployed();

  console.log(`ELU deployed to ${elu.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
