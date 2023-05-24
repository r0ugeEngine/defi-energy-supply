import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from 'chai';
import { FixedPointMath, MCGR, StakingReward } from "../typechain";
import { ELU } from "../typechain/contracts/tokens/ERC721/ELU";
import { NRGS } from "../typechain/contracts/tokens/ERC721/NRGS";


describe("Staking", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [deployer, otherAcc] = await ethers.getSigners();

    const MCGR: ContractFactory = await ethers.getContractFactory("MCGR");
    const mcgr: MCGR = await MCGR.deploy() as MCGR;
    await mcgr.deployed();

    const NRGS: ContractFactory = await ethers.getContractFactory("NRGS");
    const nrgs: NRGS = await NRGS.deploy() as NRGS;
    await nrgs.deployed();

    const FixedPointMath: ContractFactory = await ethers.getContractFactory("FixedPointMath");
    const fixedPoint: FixedPointMath = await FixedPointMath.deploy() as FixedPointMath;
    await fixedPoint.deployed();

    const StakingReward: ContractFactory = await ethers.getContractFactory("StakingReward", { libraries: { FixedPointMath: fixedPoint.address } });
    const stakingReward: StakingReward = await StakingReward.deploy(mcgr.address, nrgs.address, 10) as StakingReward;
    await stakingReward.deployed();

    return { mcgr, nrgs, stakingReward, fixedPoint, deployer, otherAcc };
  }

  it('Deployed correctly', async () => {
    const { mcgr, stakingReward, nrgs, fixedPoint, deployer } = await loadFixture(deployFixture);

    expect(mcgr.address).to.be.properAddress;
    expect(stakingReward.address).to.be.properAddress;
    expect(nrgs.address).to.be.properAddress;
    expect(fixedPoint.address).to.be.properAddress;

    expect(await mcgr.name()).to.be.eq("Mictrogrid Reward token");
    expect(await mcgr.symbol()).to.be.eq("MCGR");
    expect(await nrgs.name()).to.be.eq("Energy Supply token");
    expect(await nrgs.symbol()).to.be.eq("NRGS");

    const admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
    const minter_role = await mcgr.MINTER_ROLE();
    const burner_role = await mcgr.BURNER_ROLE();
    const staking_role = await stakingReward.STAKING_MANAGER_ROLE();

    expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(burner_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(burner_role, deployer.address)).to.be.true;
    expect(await stakingReward.hasRole(staking_role, deployer.address)).to.be.true;

    expect(await stakingReward.NRGS()).to.be.eq(nrgs.address);
    expect(await stakingReward.MCGR()).to.be.eq(mcgr.address);
  });

});
