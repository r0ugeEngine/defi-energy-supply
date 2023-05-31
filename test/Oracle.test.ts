import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, ContractFactory } from "ethers";
import { ethers } from "hardhat";
import { expect } from 'chai';
import { EnergyOracle, FixedPointMath, MCGR, Manager, Register, StakingReward } from "../typechain";
import { ELU } from "../typechain/contracts/tokens/ERC721/ELU";
import { NRGS } from "../typechain/contracts/tokens/ERC721/NRGS";


describe("Oracle", function () {

	let otherAccAddress: string;
	let admin_role: string, minter_role: string, burner_role: string, energy_oracle_manager: string, oracle_provider: string, escrow: string;
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

		const Oracle: ContractFactory = await ethers.getContractFactory("EnergyOracle");
		const oracle: EnergyOracle = await Oracle.deploy(manager.address) as EnergyOracle;
		await oracle.deployed();

		minter_role = await mcgr.MINTER_ROLE();
		burner_role = await mcgr.BURNER_ROLE();
		admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
		energy_oracle_manager = await oracle.ENERGY_ORACLE_MANAGER_ROLE();
		oracle_provider = await oracle.ORACLE_PROVIDER_ROLE();
		escrow = await oracle.ESCROW();

		await oracle.grantRole(escrow, deployer.address);
		await mcgr.grantRole(minter_role, oracle.address);

		return { mcgr, elu, ELU, nrgs, NRGS, manager, oracle, Oracle, deployer, otherAcc };
	}

	it('Deployed correctly', async () => {
		const { mcgr, elu, nrgs, oracle, manager, deployer } = await loadFixture(deployFixture);

		expect(mcgr.address).to.be.properAddress;
		expect(nrgs.address).to.be.properAddress;
		expect(elu.address).to.be.properAddress;
		expect(oracle.address).to.be.properAddress;
		expect(oracle.address).to.be.properAddress;

		expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
		expect(await mcgr.hasRole(minter_role, oracle.address)).to.be.true;
		expect(await mcgr.hasRole(burner_role, deployer.address)).to.be.true;
		expect(await oracle.hasRole(escrow, deployer.address)).to.be.true;
		expect(await oracle.hasRole(oracle_provider, deployer.address)).to.be.true;
		expect(await oracle.hasRole(energy_oracle_manager, deployer.address)).to.be.true;
	});

	describe("Registers", function () {
		it('ORACLE_PROVIDER can record consumption', async () => {
			const { oracle, nrgs, deployer } = await loadFixture(deployFixture);

			await nrgs.mint(deployer.address, 10);
			const now = await time.latest();

			const record = await oracle.recordEnergyConsumption(deployer.address, 10, now, 9);


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
		});

		it('Requires valid token id', async () => {
			const { register, deployer } = await loadFixture(deployFixture);
			const errorMsg = "ERC721: invalid token ID";

			await expect(register.unRegisterSupplier(deployer.address, 10)).to.be.revertedWith(errorMsg);
			await expect(register.unRegisterElectricityUser(deployer.address, 10)).to.be.revertedWith(errorMsg);
		});
	});

});
