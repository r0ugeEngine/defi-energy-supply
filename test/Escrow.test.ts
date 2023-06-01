import { time, loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Escrow, MCGR, Manager, OracleMock, MainMock } from '../typechain';
import { ELU } from '../typechain/contracts/tokens/ERC721/ELU';
import { NRGS } from '../typechain/contracts/tokens/ERC721/NRGS';

describe('Escrow', function () {
	let otherAccAddress: string;
	let admin_role: string, minter_role: string, burner_role: string, escrow_manager: string;
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

		const OracleMock: ContractFactory = await ethers.getContractFactory('OracleMock');
		const oracle: OracleMock = (await OracleMock.deploy()) as OracleMock;
		await oracle.deployed();

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

		await manager.changeOracle(oracle.address);

		const Escrow: ContractFactory = await ethers.getContractFactory('Escrow');
		const escrow: Escrow = (await Escrow.deploy(manager.address)) as Escrow;
		await escrow.deployed();

		const MainMock: ContractFactory = await ethers.getContractFactory('MainMock');
		const main: MainMock = (await MainMock.deploy(escrow.address, mcgr.address)) as MainMock;
		await main.deployed();

		minter_role = await mcgr.MINTER_ROLE();
		burner_role = await mcgr.BURNER_ROLE();
		admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
		escrow_manager = await escrow.ESCROW_MANAGER_ROLE();

		await escrow.grantRole(escrow_manager, main.address);

		return { mcgr, elu, ELU, nrgs, NRGS, manager, escrow, main, oracle, deployer, otherAcc };
	}

	it('Deployed correctly', async () => {
		const { mcgr, elu, nrgs, escrow, main, deployer } = await loadFixture(deployFixture);

		expect(mcgr.address).to.be.properAddress;
		expect(nrgs.address).to.be.properAddress;
		expect(elu.address).to.be.properAddress;
		expect(escrow.address).to.be.properAddress;

		expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
		expect(await mcgr.hasRole(burner_role, deployer.address)).to.be.true;
		expect(await escrow.hasRole(admin_role, deployer.address)).to.be.true;
		expect(await escrow.hasRole(escrow_manager, deployer.address)).to.be.true;
		expect(await escrow.hasRole(escrow_manager, main.address)).to.be.true;
	});

	it('ESCROW_MANAGER_ROLE can send to supplier, feeReceiver funds', async () => {
		const { escrow, elu, deployer, otherAcc, main, mcgr } = await loadFixture(deployFixture);

		await mcgr.mint(otherAcc.address, 1000);
		await mcgr.connect(otherAcc).approve(main.address, 1000);

		const balBefore = await mcgr.balanceOf(otherAcc.address);
		expect(balBefore).to.eq(1000);

		await elu.mint(otherAcc.address, 10, deployer.address);

		const EnergyConsumption = 555;
		const fees = 10;
		const needToBePaid = EnergyConsumption + fees;

		const sending = await main.send(otherAcc.address, 10, deployer.address, needToBePaid);

		const balAfter = await mcgr.balanceOf(otherAcc.address);
		expect(balAfter).to.eq(1000 - (EnergyConsumption + fees));

		expect(sending).to.emit(escrow, 'PaidForEnergy');
		expect(sending).to.changeTokenBalances(mcgr, [otherAcc, deployer], [-needToBePaid, needToBePaid]);
	});

	it('Remaining amount will be sent back', async () => {
		const { escrow, elu, deployer, otherAcc, main, mcgr } = await loadFixture(deployFixture);

		await mcgr.mint(otherAcc.address, 1000);
		await mcgr.connect(otherAcc).approve(main.address, 1000);

		const balBefore = await mcgr.balanceOf(otherAcc.address);
		expect(balBefore).to.eq(1000);

		await elu.mint(otherAcc.address, 10, deployer.address);

		const EnergyConsumption = 555;
		const fees = 10;
		const needToBePaid = EnergyConsumption + fees;

		const sending = await main.send(otherAcc.address, 10, deployer.address, needToBePaid + 10);

		const balAfter = await mcgr.balanceOf(otherAcc.address);
		expect(balAfter).to.eq(1000 - (EnergyConsumption + fees));

		expect(sending).to.emit(escrow, 'PaidForEnergy');
		expect(sending).to.changeTokenBalances(mcgr, [otherAcc, deployer], [-needToBePaid, needToBePaid]);
	});

	describe('Errors', function () {
		it('Only ESCROW_MANAGER_ROLE', async () => {
			const { escrow, deployer, otherAcc, } = await loadFixture(deployFixture);

			const error = `AccessControl: account ${otherAccAddress} is missing role ${escrow_manager}`;
			await expect(escrow.connect(otherAcc).sendFundsToSupplier(otherAcc.address, 10, deployer.address, 5)).to.be.revertedWith(error);
		});

		it('Zero address checks', async () => {
			const { escrow, deployer } = await loadFixture(deployFixture);
			const error = 'Escrow: account is address 0';
			const address0 = ethers.constants.AddressZero;

			await expect(escrow.sendFundsToSupplier(address0, 10, deployer.address, 5)).to.be.revertedWith(error);
			await expect(escrow.sendFundsToSupplier(deployer.address, 10, address0, 5)).to.be.revertedWith(error);
		});

		it('Greater than zero Check', async () => {
			const { escrow, deployer } = await loadFixture(deployFixture);
			const error = 'Escrow: passed value is <= 0';

			await expect(escrow.sendFundsToSupplier(deployer.address, 10, deployer.address, 0)).to.be.revertedWith(error);
		});

		it('User needs to be correctly connected to supplier', async () => {
			const { escrow, deployer, otherAcc } = await loadFixture(deployFixture);
			const error = 'Escrow: user connected to another supplier';

			await expect(escrow.sendFundsToSupplier(deployer.address, 10, otherAcc.address, 5)).to.be.revertedWith(error);
		});

		it('Escrow must be properly paid', async () => {
			const { escrow, deployer, otherAcc, elu } = await loadFixture(deployFixture);
			const error = 'Escrow: not enough funds sent';

			await elu.mint(deployer.address, 10, otherAcc.address);

			await expect(escrow.sendFundsToSupplier(deployer.address, 10, otherAcc.address, 5)).to.be.revertedWith(error);
		});
	});
});
