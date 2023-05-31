import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from 'chai';
import { FixedPointMath, MCGR, Manager, Register, StakingReward } from "../typechain";
import { ELU } from "../typechain/contracts/tokens/ERC721/ELU";
import { NRGS } from "../typechain/contracts/tokens/ERC721/NRGS";


describe("Manager", function () {

	let otherAccAddress: string;
	let admin_role: string, minter_role: string, burner_role: string, staking_role: string, register_role: string, manager_role: string;
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployFixture() {
		const [deployer, otherAcc] = await ethers.getSigners();

		otherAccAddress = otherAcc.address.toLowerCase();

		const MCGR: ContractFactory = await ethers.getContractFactory("MCGR");
		const mcgr: MCGR = await MCGR.deploy() as MCGR;
		await mcgr.deployed();

		const NRGS: ContractFactory = await ethers.getContractFactory("NRGS");
		const nrgs: NRGS = await NRGS.deploy() as NRGS;
		await nrgs.deployed();

		const ELU: ContractFactory = await ethers.getContractFactory("ELU");
		const elu: ELU = await ELU.deploy() as ELU;
		await elu.deployed();

		const Manager: ContractFactory = await ethers.getContractFactory("Manager");
		const manager: Manager = await Manager.deploy(mcgr.address, elu.address, nrgs.address, 10, 10, 5) as Manager;
		await manager.deployed();

		const FixedPointMath: ContractFactory = await ethers.getContractFactory("FixedPointMath");
		const fixedPoint: FixedPointMath = await FixedPointMath.deploy() as FixedPointMath;
		await fixedPoint.deployed();

		const StakingReward: ContractFactory = await ethers.getContractFactory("StakingReward", { libraries: { FixedPointMath: fixedPoint.address } });
		const stakingReward: StakingReward = await StakingReward.deploy(manager.address) as StakingReward;
		await stakingReward.deployed();

		const Register: ContractFactory = await ethers.getContractFactory("Register");
		const register: Register = await Register.deploy(manager.address) as Register;
		await register.deployed();

		minter_role = await mcgr.MINTER_ROLE();
		burner_role = await mcgr.BURNER_ROLE();
		admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
		staking_role = await stakingReward.STAKING_MANAGER_ROLE();
		register_role = await register.REGISTER_MANAGER_ROLE();
		manager_role = await manager.MANAGER_ROLE();

		await manager.changeRewardAmount(10);
		await manager.changeStakingContract(stakingReward.address);

		await mcgr.grantRole(minter_role, stakingReward.address);

		await nrgs.grantRole(minter_role, register.address);
		await elu.grantRole(minter_role, register.address);
		await nrgs.grantRole(burner_role, register.address);
		await elu.grantRole(burner_role, register.address);

		await stakingReward.grantRole(staking_role, register.address);

		return { manager, MCGR, mcgr, elu, ELU, nrgs, NRGS, stakingReward, StakingReward, register, deployer, otherAcc };
	}

	it('Deployed correctly', async () => {
		const { mcgr, elu, nrgs, stakingReward, register, manager, deployer } = await loadFixture(deployFixture);

		expect(mcgr.address).to.be.properAddress;
		expect(nrgs.address).to.be.properAddress;
		expect(elu.address).to.be.properAddress;
		expect(stakingReward.address).to.be.properAddress;
		expect(register.address).to.be.properAddress;

		expect(await mcgr.name()).to.be.eq("Mictrogrid Reward token");
		expect(await mcgr.symbol()).to.be.eq("MCGR");
		expect(await nrgs.name()).to.be.eq("Energy Supply token");
		expect(await nrgs.symbol()).to.be.eq("NRGS");

		expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
		expect(await mcgr.hasRole(minter_role, stakingReward.address)).to.be.true;
		expect(await mcgr.hasRole(burner_role, deployer.address)).to.be.true;
		expect(await nrgs.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await nrgs.hasRole(minter_role, deployer.address)).to.be.true;
		expect(await nrgs.hasRole(minter_role, register.address)).to.be.true;
		expect(await nrgs.hasRole(burner_role, deployer.address)).to.be.true;
		expect(await nrgs.hasRole(burner_role, register.address)).to.be.true;
		expect(await elu.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await elu.hasRole(minter_role, deployer.address)).to.be.true;
		expect(await elu.hasRole(minter_role, register.address)).to.be.true;
		expect(await elu.hasRole(burner_role, deployer.address)).to.be.true;
		expect(await elu.hasRole(burner_role, register.address)).to.be.true;
		expect(await stakingReward.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await stakingReward.hasRole(staking_role, deployer.address)).to.be.true;
		expect(await stakingReward.hasRole(staking_role, register.address)).to.be.true;
		expect(await register.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await register.hasRole(register_role, deployer.address)).to.be.true;

		expect(await stakingReward.manager()).to.be.eq(manager.address);
		expect(await register.manager()).to.be.eq(manager.address);
	});

	describe("Manage", function () {
		it('Manager can change MCGR', async () => {
			const { manager, MCGR, mcgr } = await loadFixture(deployFixture);

			const mcgr2: MCGR = await MCGR.deploy() as MCGR;
			await mcgr2.deployed();

			const prevMcgr = await manager.MCGR();

			await manager.changeMCGR(mcgr2.address);
			const currMcgr = await manager.MCGR();

			expect(prevMcgr).to.be.eq(mcgr.address);
			expect(currMcgr).to.be.eq(mcgr2.address);
		});

		it('Manager can change ELU', async () => {
			const { manager, ELU, elu } = await loadFixture(deployFixture);

			const elu2: ELU = await ELU.deploy() as ELU;
			await elu2.deployed();

			const prevElu = await manager.ELU();

			await manager.changeELU(elu2.address);
			const currElu = await manager.ELU();

			expect(prevElu).to.be.eq(elu.address);
			expect(currElu).to.be.eq(elu2.address);
		});

		it('Manager can change NRGS', async () => {
			const { manager, NRGS, nrgs } = await loadFixture(deployFixture);

			const nrgs2: NRGS = await NRGS.deploy() as NRGS;
			await nrgs2.deployed();

			const prevNrgs = await manager.NRGS();

			await manager.changeNRGS(nrgs2.address);
			const currNrgs = await manager.NRGS();

			expect(prevNrgs).to.be.eq(nrgs.address);
			expect(currNrgs).to.be.eq(nrgs2.address);
		});

		it('Manager can change Staking', async () => {
			const { manager, stakingReward, StakingReward } = await loadFixture(deployFixture);

			const staking2: StakingReward = await StakingReward.deploy(manager.address) as StakingReward;
			await staking2.deployed();

			const prevStaking = await manager.staking();

			await manager.changeStakingContract(staking2.address);
			const currStaking = await manager.staking();

			expect(prevStaking).to.be.eq(stakingReward.address);
			expect(currStaking).to.be.eq(staking2.address);
		});

		it('Manager can change RewardAmount', async () => {
			const { manager } = await loadFixture(deployFixture);

			const prevReward = await manager.rewardAmount();

			await manager.changeRewardAmount(20);
			const currReward = await manager.rewardAmount();

			expect(prevReward).to.be.eq(10);
			expect(currReward).to.be.eq(20);
		});
	});

	describe("Errors", function () {
		it('Only MANAGER_ROLE', async () => {
			const { manager, otherAcc } = await loadFixture(deployFixture);

			const errorMsg = `AccessControl: account ${otherAccAddress} is missing role ${manager_role}`;

			await expect(manager.connect(otherAcc).changeMCGR(otherAcc.address)).to.be.revertedWith(errorMsg);
			await expect(manager.connect(otherAcc).changeNRGS(otherAcc.address)).to.be.revertedWith(errorMsg);
			await expect(manager.connect(otherAcc).changeELU(otherAcc.address)).to.be.revertedWith(errorMsg);
			await expect(manager.connect(otherAcc).changeStakingContract(otherAcc.address)).to.be.revertedWith(errorMsg);
			await expect(manager.connect(otherAcc).changeRewardAmount(20)).to.be.revertedWith(errorMsg);
		});

		it('Zero Address Check', async () => {
			const { manager } = await loadFixture(deployFixture);
			const addressZero = ethers.constants.AddressZero;
			const errorMsg = "Manager: passed address is address 0";

			await expect(manager.changeMCGR(addressZero)).to.be.revertedWith(errorMsg);
			await expect(manager.changeNRGS(addressZero)).to.be.revertedWith(errorMsg);
			await expect(manager.changeELU(addressZero)).to.be.revertedWith(errorMsg);
			await expect(manager.changeStakingContract(addressZero)).to.be.revertedWith(errorMsg);
		});
	});
});
