import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from 'chai';
import { FixedPointMath, MCGR, StakingReward } from "../typechain";
import { ELU } from "../typechain/contracts/tokens/ERC721/ELU";
import { NRGS } from "../typechain/contracts/tokens/ERC721/NRGS";


describe("Staking", function () {

  const otherAccAddress = '0x1400a04079772bf421bf53f25da828c95d4fa8bb';
  let admin_role: string, minter_role: string, burner_role: string, staking_role: string;
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

    const minter = await mcgr.MINTER_ROLE();
    await mcgr.grantRole(minter, stakingReward.address);

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

    admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
    minter_role = await mcgr.MINTER_ROLE();
    burner_role = await mcgr.BURNER_ROLE();
    staking_role = await stakingReward.STAKING_MANAGER_ROLE();

    expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(minter_role, stakingReward.address)).to.be.true;
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

    it('Only manager can change management functions', async () => {
      const { stakingReward, mcgr, nrgs, otherAcc } = await loadFixture(deployFixture);
      const errorMsg = `AccessControl: account ${otherAccAddress} is missing role ${staking_role}`;

      await expect(stakingReward.connect(otherAcc).changeRewardAmount(5)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.connect(otherAcc).changeNRGS(nrgs.address)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.connect(otherAcc).changeMCGR(mcgr.address)).to.be.revertedWith(errorMsg);
    });
  });

  describe("Rewards", function () {
    it('Manager can add supplier to staking', async () => {
      const { stakingReward, nrgs, deployer } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      const tx = await stakingReward.enterStaking(deployer.address, 0);
      const now = await time.latest();

      const sup = await stakingReward.suppliers(deployer.address, 0);

      expect(tx).to.emit(stakingReward, "EnterStaking");
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);
    });

    it('Manager can remove supplier from staking', async () => {
      const { stakingReward, nrgs, deployer, mcgr } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      const txEnter = await stakingReward.enterStaking(deployer.address, 0);
      const now = await time.latest();

      let sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txEnter).to.emit(stakingReward, "EnterStaking");
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);

      const txExit = await stakingReward.exitStaking(deployer.address, 0);

      sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txExit).to.emit(stakingReward, "ExitStaking");
      expect(sup.updatedAt).to.be.eq(0);
      expect(sup.pendingReward).to.be.eq(0);
    });

    it('Everyone can update rewards to supplier', async () => {
      const { stakingReward, nrgs, deployer } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      const txEnter = await stakingReward.enterStaking(deployer.address, 0);
      let now = await time.latest();

      let sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txEnter).to.emit(stakingReward, "EnterStaking");
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);

      await time.increaseTo(now + 200);

      now = await time.latest();
      const totalSuppliers = await stakingReward.totalSuppliers();
      const rewardAmount = await stakingReward.rewardAmount();
      const timePassed = BigNumber.from(now).sub(sup.updatedAt);
      const rewardToUser = rewardAmount.mul(timePassed).div(totalSuppliers);

      const txSend = await stakingReward.updateRewards(deployer.address, 0);
      sup = await stakingReward.suppliers(deployer.address, 0);

      now = await time.latest();

      expect(txSend).to.emit(stakingReward, "RewardSent");
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(rewardToUser.add(rewardAmount));
    });

    it('Manager can send rewards to supplier', async () => {
      const { stakingReward, nrgs, deployer, mcgr } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      let mcgrBalance = await mcgr.balanceOf(deployer.address);
      expect(mcgrBalance).to.eq(0);

      const txEnter = await stakingReward.enterStaking(deployer.address, 0);
      let now = await time.latest();

      let sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txEnter).to.emit(stakingReward, "EnterStaking");
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);

      await time.increaseTo(now + 200);

      now = await time.latest();
      const totalSuppliers = await stakingReward.totalSuppliers();
      const rewardAmount = await stakingReward.rewardAmount();
      const timePassed = BigNumber.from(now).sub(sup.updatedAt);
      const rewardToUser = rewardAmount.mul(timePassed).div(totalSuppliers);

      const txSend = await stakingReward.sendRewards(deployer.address, 0);
      now = await time.latest();
      mcgrBalance = await mcgr.balanceOf(deployer.address);

      expect(txSend).to.emit(stakingReward, "RewardSent");
      expect(sup.updatedAt).to.be.approximately(now, 1000);
      expect(mcgrBalance.toNumber()).to.be.eq(rewardToUser.add(rewardAmount).toNumber());
    });
  });

  describe("Errors", function () {
    it('Only STAKING_MANAGER_ROLE', async () => {
      const { stakingReward, otherAcc } = await loadFixture(deployFixture);

      const errorMsg = `AccessControl: account ${otherAccAddress} is missing role ${staking_role}`;

      await expect(stakingReward.connect(otherAcc).enterStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.connect(otherAcc).sendRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.connect(otherAcc).exitStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
    });

    it('Zero Address Check', async () => {
      const { stakingReward } = await loadFixture(deployFixture);
      const addressZero = ethers.constants.AddressZero;
      const errorMsg = "StakingReward: supplier is address 0";


      await expect(stakingReward.enterStaking(addressZero, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.sendRewards(addressZero, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.exitStaking(addressZero, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.updateRewards(addressZero, 10)).to.be.revertedWith(errorMsg);
    });

    it('Is Correct Owner', async () => {
      const { stakingReward, otherAcc, deployer, nrgs } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 10);
      const errorMsg = "StakingReward: supplier is not the owner of this token";


      await expect(stakingReward.enterStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.sendRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.exitStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.updateRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
    });

    it('Is Correct Owner', async () => {
      const { stakingReward, otherAcc, deployer, nrgs } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 10);
      const errorMsg = "StakingReward: supplier is not the owner of this token";


      await expect(stakingReward.enterStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.sendRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.exitStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.updateRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
    });

    it('updateRewards requires', async () => {
      const { stakingReward, otherAcc, deployer, nrgs } = await loadFixture(deployFixture);
      await nrgs.mint(otherAcc.address, 10);

      const errorMsg1 = "StakingReward: supplier is not entered with this token";
      const errorMsg2 = "StakingReward: updatedAt error";

      await expect(stakingReward.updateRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg1);
    });
  });

});
