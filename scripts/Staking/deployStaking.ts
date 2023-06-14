import { ethers } from 'hardhat';

const Manager = '0x61E0e280B1E05FCEfb684dd729cDe782fd98cd40';

async function main() {
  const FixedPointMath = await ethers.getContractFactory('FixedPointMath');
  const fixedPoint = await FixedPointMath.deploy();
  await fixedPoint.deployed();

  console.log(`FixedPointMath deployed to ${fixedPoint.address}`);

  const StakingReward = await ethers.getContractFactory('StakingReward', {
    libraries: { FixedPointMath: fixedPoint.address },
  });
  const stakingReward = await StakingReward.deploy(Manager);
  await stakingReward.deployed();

  console.log(`StakingReward deployed to ${stakingReward.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
