import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from 'chai';
import { FixedPointMath, MCGR, Register, StakingReward } from "../typechain";
import { ELU } from "../typechain/contracts/tokens/ERC721/ELU";
import { NRGS } from "../typechain/contracts/tokens/ERC721/NRGS";


describe("Register", function () {

	let otherAccAddress: string;
	let admin_role: string, minter_role: string, burner_role: string, staking_role: string, register_role: string;
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

		const FixedPointMath: ContractFactory = await ethers.getContractFactory("FixedPointMath");
		const fixedPoint: FixedPointMath = await FixedPointMath.deploy() as FixedPointMath;
		await fixedPoint.deployed();

		const StakingReward: ContractFactory = await ethers.getContractFactory("StakingReward", { libraries: { FixedPointMath: fixedPoint.address } });
		const stakingReward: StakingReward = await StakingReward.deploy(mcgr.address, nrgs.address, 10) as StakingReward;
		await stakingReward.deployed();

		const Register: ContractFactory = await ethers.getContractFactory("Register");
		const register: Register = await Register.deploy(elu.address, nrgs.address, stakingReward.address) as Register;
		await register.deployed();

		minter_role = await mcgr.MINTER_ROLE();
		burner_role = await mcgr.BURNER_ROLE();
		admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
		staking_role = await stakingReward.STAKING_MANAGER_ROLE();
		register_role = await register.REGISTER_MANAGER_ROLE();

		await mcgr.grantRole(minter_role, stakingReward.address);

		await nrgs.grantRole(minter_role, register.address);
		await elu.grantRole(minter_role, register.address);
		await nrgs.grantRole(burner_role, register.address);
		await elu.grantRole(burner_role, register.address);

		await stakingReward.grantRole(staking_role, register.address);

		return { mcgr, elu, ELU, nrgs, NRGS, stakingReward, StakingReward, register, deployer, otherAcc };
	}

	it('Deployed correctly', async () => {
		const { mcgr, elu, nrgs, stakingReward, register, deployer } = await loadFixture(deployFixture);

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

		expect(await stakingReward.NRGS()).to.be.eq(nrgs.address);
		expect(await stakingReward.MCGR()).to.be.eq(mcgr.address);

		expect(await register.NRGS()).to.be.eq(nrgs.address);
		expect(await register.ELU()).to.be.eq(elu.address);
		expect(await register.staking()).to.be.eq(stakingReward.address);
	});

	describe("Management", function () {
		it('Manager can change ELU', async () => {
			const { ELU, register } = await loadFixture(deployFixture);

			const oldEluAddress = await register.ELU();

			const newElu: ELU = await ELU.deploy() as ELU;
			await newElu.deployed();

			const tx = await register.changeELU(newElu.address);
			const newEluAddress = await register.ELU();

			expect(tx).to.emit(register, "ELUchanged");
			expect(newEluAddress).not.to.be.eq(oldEluAddress);
			expect(newEluAddress).to.be.eq(newElu.address);
		});

		it('Manager can change NRGS', async () => {
			const { NRGS, register } = await loadFixture(deployFixture);

			const oldNrgsAddress = await register.NRGS();

			const newNrgs: NRGS = await NRGS.deploy() as NRGS;
			await newNrgs.deployed();

			const tx = await register.changeNRGS(newNrgs.address);
			const newNrgsAddress = await register.NRGS();

			expect(tx).to.emit(register, "NRGSchanged");
			expect(newNrgsAddress).not.to.be.eq(oldNrgsAddress);
			expect(newNrgsAddress).to.be.eq(newNrgs.address);
		});

		it('Manager can change Staking contract link', async () => {
			const { register, mcgr, nrgs, StakingReward } = await loadFixture(deployFixture);

			const oldStaking = await register.staking();

			const newStakingReward: StakingReward = await StakingReward.deploy(mcgr.address, nrgs.address, 10) as StakingReward;
			await newStakingReward.deployed();

			const tx = await register.changeStakingContract(newStakingReward.address);
			const newStaking = await register.staking();

			expect(tx).to.emit(register, "StakingChanged");
			expect(newStaking).not.to.be.eq(oldStaking);
			expect(newStaking).to.be.eq(newStakingReward.address);
		});

		it('Only manager can change management functions', async () => {
			const { register, stakingReward, elu, nrgs, otherAcc } = await loadFixture(deployFixture);
			const errorMsg = `AccessControl: account ${otherAccAddress} is missing role ${register_role}`;

			await expect(register.connect(otherAcc).changeStakingContract(stakingReward.address)).to.be.revertedWith(errorMsg);
			await expect(register.connect(otherAcc).changeNRGS(nrgs.address)).to.be.revertedWith(errorMsg);
			await expect(register.connect(otherAcc).changeELU(elu.address)).to.be.revertedWith(errorMsg);
		});
	});

	describe("Registers", function () {
		it('Manager can register supllier', async () => {
			const { register, stakingReward, nrgs, deployer } = await loadFixture(deployFixture);
			const registration = await register.registerSupplier(deployer.address, 5);

			const ownerOf5 = await nrgs.ownerOf(5);
			const now = await time.latest();

			const sup = await stakingReward.suppliers(deployer.address, 5);

			expect(registration).to.emit(register, "SupplierRegistered");
			expect(registration).to.emit(nrgs, "Transfer");
			expect(registration).to.emit(stakingReward, "EnterStaking");
			expect(ownerOf5).to.be.eq(deployer.address);
			expect(sup.updatedAt).to.be.eq(now);
			expect(sup.pendingReward).to.be.eq(0);
		});

		it('Manager can un register supllier', async () => {
			const { register, stakingReward, nrgs, deployer } = await loadFixture(deployFixture);
			const registration = await register.registerSupplier(deployer.address, 5);

			const ownerOf5 = await nrgs.ownerOf(5);
			let now = await time.latest();

			let sup = await stakingReward.suppliers(deployer.address, 5);

			expect(registration).to.emit(register, "SupplierRegistered");
			expect(registration).to.emit(nrgs, "Transfer");
			expect(registration).to.emit(stakingReward, "EnterStaking");
			expect(ownerOf5).to.be.eq(deployer.address);
			expect(sup.updatedAt).to.be.eq(now);
			expect(sup.pendingReward).to.be.eq(0);

			const unRegistration = await register.unRegisterSupplier(deployer.address, 5);

			now = await time.latest();

			sup = await stakingReward.suppliers(deployer.address, 5);

			expect(unRegistration).to.emit(register, "SupplierUnregistered");
			expect(unRegistration).to.emit(nrgs, "Transfer");
			expect(unRegistration).to.emit(stakingReward, "ExitStaking");
			expect(sup.updatedAt).to.be.eq(0);
			expect(sup.pendingReward).to.be.eq(0);
		});

		it('Manager can register users', async () => {
			const { register, elu, deployer } = await loadFixture(deployFixture);
			const registration = await register.registerElectricityUser(deployer.address, 5, deployer.address);

			const ownerOf5 = await elu.ownerOf(5);
			const userToSup = await elu.userToSupplier(deployer.address);

			expect(registration).to.emit(register, "UserRegistered");
			expect(registration).to.emit(elu, "Transfer");
			expect(ownerOf5).to.be.eq(deployer.address);
			expect(userToSup).to.be.eq(deployer.address);
		});

		it('Manager can un register users', async () => {
			const { register, elu, deployer } = await loadFixture(deployFixture);
			const registration = await register.registerElectricityUser(deployer.address, 5, deployer.address);

			const ownerOf5 = await elu.ownerOf(5);
			const userToSup = await elu.userToSupplier(deployer.address);

			expect(registration).to.emit(register, "UserRegistered");
			expect(registration).to.emit(elu, "Transfer");
			expect(ownerOf5).to.be.eq(deployer.address);
			expect(userToSup).to.be.eq(deployer.address);

			const unRegistration = await register.unRegisterElectricityUser(deployer.address, 5);

			expect(unRegistration).to.emit(register, "SupplierUnregistered");
			expect(unRegistration).to.emit(elu, "Transfer");
		});
	});

	describe("Errors", function () {
		it('Only REGISTER_MANAGER_ROLE', async () => {
			const { register, otherAcc, deployer } = await loadFixture(deployFixture);

			const errorMsg = `AccessControl: account ${otherAccAddress} is missing role ${register_role}`;

			await expect(register.connect(otherAcc).registerSupplier(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
			await expect(register.connect(otherAcc).registerElectricityUser(otherAcc.address, 10, deployer.address)).to.be.revertedWith(errorMsg);
			await expect(register.connect(otherAcc).unRegisterSupplier(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
			await expect(register.connect(otherAcc).unRegisterElectricityUser(otherAcc.address, 10)).to.be.revertedWith(errorMsg);
		});

		it('Zero Address Check', async () => {
			const { register, deployer } = await loadFixture(deployFixture);
			const addressZero = ethers.constants.AddressZero;
			const errorMsg = "Register: supplier is address 0";


			await expect(register.registerSupplier(addressZero, 10)).to.be.revertedWith(errorMsg);
			await expect(register.registerElectricityUser(addressZero, 10, deployer.address)).to.be.revertedWith(errorMsg);
			await expect(register.registerElectricityUser(deployer.address, 10, addressZero)).to.be.revertedWith(errorMsg);
			await expect(register.unRegisterSupplier(addressZero, 10)).to.be.revertedWith(errorMsg);
			await expect(register.unRegisterElectricityUser(addressZero, 10)).to.be.revertedWith(errorMsg);
			await expect(register.changeELU(addressZero)).to.be.revertedWith(errorMsg);
			await expect(register.changeNRGS(addressZero)).to.be.revertedWith(errorMsg);
			await expect(register.changeStakingContract(addressZero)).to.be.revertedWith(errorMsg);
		});

		it('Requires valid token id', async () => {
			const { register, deployer } = await loadFixture(deployFixture);
			const errorMsg = "ERC721: invalid token ID";

			await expect(register.unRegisterSupplier(deployer.address, 10)).to.be.revertedWith(errorMsg);
			await expect(register.unRegisterElectricityUser(deployer.address, 10)).to.be.revertedWith(errorMsg);
		});
	});

});
