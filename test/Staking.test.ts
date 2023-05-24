import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, ContractFactory } from "ethers";
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

    return { mcgr, MCGR, nrgs, NRGS, stakingReward, fixedPoint, deployer, otherAcc };
  }

  it('Deployed correctly', async () => {
    const { mcgr, nrgs, stakingReward, fixedPoint, deployer } = await loadFixture(deployFixture);

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

  describe("Management", function () {
    it('Manager can change MCGR', async () => {
      const { MCGR, stakingReward } = await loadFixture(deployFixture);

      const oldMcgrAddress = await stakingReward.MCGR();

      const newMcgr: MCGR = await MCGR.deploy() as MCGR;
      await newMcgr.deployed();

      const tx = await stakingReward.changeMCGR(newMcgr.address);
      const newMcgrAddress = await stakingReward.MCGR();

      expect(tx).to.emit(stakingReward, "MCGRchanged");
      expect(newMcgrAddress).not.to.be.eq(oldMcgrAddress);
      expect(newMcgrAddress).to.be.eq(newMcgr.address);
    });

    it('Manager can change NRGS', async () => {
      const { NRGS, stakingReward } = await loadFixture(deployFixture);

      const oldNrgsAddress = await stakingReward.NRGS();

      const newNrgs: NRGS = await NRGS.deploy() as NRGS;
      await newNrgs.deployed();

      const tx = await stakingReward.changeNRGS(newNrgs.address);
      const newNrgsAddress = await stakingReward.NRGS();

      expect(tx).to.emit(stakingReward, "NRGSchanged");
      expect(newNrgsAddress).not.to.be.eq(oldNrgsAddress);
      expect(newNrgsAddress).to.be.eq(newNrgs.address);
    });

    it('Manager can change RewardAmount', async () => {
      const { stakingReward } = await loadFixture(deployFixture);

      const oldRewardAmount = await stakingReward.rewardAmount();

      const tx = await stakingReward.changeRewardAmount(5);
      const newRewardAmount = await stakingReward.rewardAmount();

      expect(tx).to.emit(stakingReward, "RewardAmountChanged");
      expect(newRewardAmount).not.to.be.eq(oldRewardAmount);
      expect(newRewardAmount).to.be.eq(BigNumber.from(5));
    });

    it('only manager can change management functions', async () => {
      const { stakingReward, mcgr, nrgs, otherAcc } = await loadFixture(deployFixture);
      const errorMsg = 'AccessControl: account 0x1400a04079772bf421bf53f25da828c95d4fa8bb is missing role 0xa6b5d83d32632203555cb9b2c2f68a8d94da48cadd9266ac0d17babedb52ea5b';

      await expect(stakingReward.connect(otherAcc).changeRewardAmount(5)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.connect(otherAcc).changeNRGS(nrgs.address)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.connect(otherAcc).changeMCGR(mcgr.address)).to.be.revertedWith(errorMsg);
    });


  });

});
