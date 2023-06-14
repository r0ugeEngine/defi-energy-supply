import { ethers } from 'hardhat';

const Manager = '0x61E0e280B1E05FCEfb684dd729cDe782fd98cd40';

async function main() {
  const Register = await ethers.getContractFactory('Register');
  const register = await Register.deploy(Manager);
  await register.deployed();

  console.log(`Register deployed to ${register.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
