import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { BigNumber, ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { FixedPointMath, MCGR, Manager, StakingReward, Register } from '../typechain';
import { ELU } from '../typechain/contracts/tokens/ERC1155/ELU';
import { NRGS } from '../typechain/contracts/tokens/ERC721/NRGS';

describe('Staking', function () {
  let otherAccAddress: string;
  let admin_role: string, minter_role: string, staking_role: string, register_role: string;
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [deployer, otherAcc] = await ethers.getSigners();

    otherAccAddress = otherAcc.address.toLowerCase();

    const MCGR: ContractFactory = await ethers.getContractFactory('MCGR');
    const mcgr: MCGR = (await MCGR.deploy()) as MCGR;
    await mcgr.deployed();

    const NRGS: ContractFactory = await ethers.getContractFactory('NRGS');
    const nrgs: NRGS = (await NRGS.deploy()) as NRGS;
    await nrgs.deployed();

    const ELU: ContractFactory = await ethers.getContractFactory('ELU');
    const elu: ELU = (await ELU.deploy()) as ELU;
    await elu.deployed();

    const FixedPointMath: ContractFactory = await ethers.getContractFactory('FixedPointMath');
    const fixedPoint: FixedPointMath = (await FixedPointMath.deploy()) as FixedPointMath;
    await fixedPoint.deployed();

    const Manager: ContractFactory = await ethers.getContractFactory('Manager');
    const manager: Manager = (await Manager.deploy(
      mcgr.address,
      elu.address,
      nrgs.address,
      deployer.address,
      10,
      5,
      10,
    )) as Manager;
    await manager.deployed();

    const StakingReward: ContractFactory = await ethers.getContractFactory('StakingReward', {
      libraries: { FixedPointMath: fixedPoint.address },
    });
    const stakingReward: StakingReward = (await StakingReward.deploy(manager.address)) as StakingReward;
    await stakingReward.deployed();

    const Register: ContractFactory = await ethers.getContractFactory('Register');
    const register: Register = (await Register.deploy(manager.address)) as Register;
    await register.deployed();

    admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
    minter_role = await mcgr.MINTER_BURNER_ROLE();
    register_role = await nrgs.REGISTER_ROLE();
    staking_role = await stakingReward.STAKING_MANAGER_ROLE();

    await mcgr.grantRole(minter_role, stakingReward.address);

    return { mcgr, MCGR, nrgs, NRGS, register, stakingReward, fixedPoint, manager, deployer, otherAcc };
  }

  it('Deployed correctly', async () => {
    const { mcgr, nrgs, stakingReward, fixedPoint, manager, deployer } = await loadFixture(deployFixture);

    expect(mcgr.address).to.be.properAddress;
    expect(stakingReward.address).to.be.properAddress;
    expect(nrgs.address).to.be.properAddress;
    expect(fixedPoint.address).to.be.properAddress;

    expect(await mcgr.name()).to.be.eq('Mictrogrid Reward token');
    expect(await mcgr.symbol()).to.be.eq('MCGR');
    expect(await nrgs.name()).to.be.eq('Energy Supply token');
    expect(await nrgs.symbol()).to.be.eq('NRGS');

    expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(minter_role, stakingReward.address)).to.be.true;

    expect(await nrgs.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(register_role, deployer.address)).to.be.true;
    expect(await stakingReward.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await stakingReward.hasRole(staking_role, deployer.address)).to.be.true;

    expect(await stakingReward.manager()).to.be.eq(manager.address);
  });

  describe('Rewards', function () {
    it('Manager can add supplier to staking', async () => {
      const { stakingReward, nrgs, deployer } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      const tx = await stakingReward.enterStaking(deployer.address, 0);
      const now = await time.latest();

      const sup = await stakingReward.suppliers(deployer.address, 0);

      expect(tx).to.emit(stakingReward, 'EnterStaking');
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);
    });

    it('Manager can remove supplier from staking', async () => {
      const { stakingReward, nrgs, deployer, mcgr } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      const txEnter = await stakingReward.enterStaking(deployer.address, 0);
      const now = await time.latest();

      let sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txEnter).to.emit(stakingReward, 'EnterStaking');
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);

      const txExit = await stakingReward.exitStaking(deployer.address, 0);

      sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txExit).to.emit(stakingReward, 'ExitStaking');
      expect(sup.updatedAt).to.be.eq(0);
      expect(sup.pendingReward).to.be.eq(0);
    });

    it('Everyone can update rewards to supplier', async () => {
      const { stakingReward, nrgs, deployer, manager } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      const txEnter = await stakingReward.enterStaking(deployer.address, 0);
      let now = await time.latest();

      let sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txEnter).to.emit(stakingReward, 'EnterStaking');
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);

      await time.increaseTo(now + 200);

      now = await time.latest();
      const totalSuppliers = await stakingReward.totalSuppliers();
      const rewardAmount = await manager.rewardAmount();
      const timePassed = BigNumber.from(now).sub(sup.updatedAt);
      const rewardToUser = rewardAmount.mul(timePassed).div(totalSuppliers);

      const txSend = await stakingReward.updateRewards(deployer.address, 0);
      sup = await stakingReward.suppliers(deployer.address, 0);

      now = await time.latest();

      expect(txSend).to.emit(stakingReward, 'RewardSent');
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(rewardToUser.add(rewardAmount));
    });

    it('Manager can send rewards to supplier', async () => {
      const { stakingReward, nrgs, deployer, mcgr, manager } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 0);

      let mcgrBalance = await mcgr.balanceOf(deployer.address);
      expect(mcgrBalance).to.eq(0);

      const txEnter = await stakingReward.enterStaking(deployer.address, 0);
      let now = await time.latest();

      let sup = await stakingReward.suppliers(deployer.address, 0);

      expect(txEnter).to.emit(stakingReward, 'EnterStaking');
      expect(sup.updatedAt).to.be.eq(now);
      expect(sup.pendingReward).to.be.eq(0);

      await time.increaseTo(now + 200);

      now = await time.latest();
      const totalSuppliers = await stakingReward.totalSuppliers();
      const rewardAmount = await manager.rewardAmount();
      const timePassed = BigNumber.from(now).sub(sup.updatedAt);
      const rewardToUser = rewardAmount.mul(timePassed).div(totalSuppliers);

      const txSend = await stakingReward.sendRewards(deployer.address, 0);
      now = await time.latest();
      mcgrBalance = await mcgr.balanceOf(deployer.address);

      expect(txSend).to.emit(stakingReward, 'RewardSent');
      expect(sup.updatedAt).to.be.approximately(now, 1000);
      expect(mcgrBalance.toNumber()).to.be.eq(rewardToUser.add(rewardAmount).toNumber());
    });
  });

  describe('Errors', function () {
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
      const errorMsg = 'StakingReward: supplier is address 0';

      await expect(stakingReward.enterStaking(addressZero, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.sendRewards(addressZero, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.exitStaking(addressZero, 10)).to.be.revertedWith(errorMsg);
      await expect(stakingReward.updateRewards(addressZero, 10)).to.be.revertedWith(errorMsg);
    });

    it('Is Correct Owner', async () => {
      const { stakingReward, otherAcc, deployer, nrgs } = await loadFixture(deployFixture);
      await nrgs.mint(deployer.address, 10);
      const errorMsg1 = 'StakingReward: supplier is not the owner of this token';
      const errorMsg2 = 'StakingReward: supplier is not entered with this token';

      await expect(stakingReward.enterStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg1);
      await expect(stakingReward.sendRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg1);
      await expect(stakingReward.exitStaking(otherAcc.address, 10)).to.be.revertedWith(errorMsg2);
      await expect(stakingReward.updateRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg1);
    });

    it('updateRewards requires', async () => {
      const { stakingReward, otherAcc, deployer, nrgs } = await loadFixture(deployFixture);
      await nrgs.mint(otherAcc.address, 10);

      const errorMsg1 = 'StakingReward: supplier is not entered with this token';
      const errorMsg2 = 'StakingReward: updatedAt error';

      await expect(stakingReward.updateRewards(otherAcc.address, 10)).to.be.revertedWith(errorMsg1);
    });
  });
});
