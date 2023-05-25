import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { ContractFactory } from 'ethers';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import { MCGR } from '../typechain';
import { ELU } from '../typechain/contracts/tokens/ERC721/ELU';
import { NRGS } from '../typechain/contracts/tokens/ERC721/NRGS';

describe(`Tokens`, function () {

  const otherAccAddress = '0x1400a04079772bf421bf53f25da828c95d4fa8bb';
  let admin_role: string, minter_role: string, burner_role: string;
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [deployer, otherAcc] = await ethers.getSigners();

    const MCGR: ContractFactory = await ethers.getContractFactory(`MCGR`);
    const mcgr: MCGR = await MCGR.deploy() as MCGR;
    await mcgr.deployed();

    const ELU: ContractFactory = await ethers.getContractFactory(`ELU`);
    const elu: ELU = await ELU.deploy() as ELU;
    await elu.deployed();

    const NRGS: ContractFactory = await ethers.getContractFactory(`NRGS`);
    const nrgs: NRGS = await NRGS.deploy() as NRGS;
    await nrgs.deployed();

    return { mcgr, elu, nrgs, deployer, otherAcc };
  }

  it('Deployed correctly', async () => {
    const { mcgr, elu, nrgs, deployer } = await loadFixture(deployFixture);

    expect(mcgr.address).to.be.properAddress;
    expect(elu.address).to.be.properAddress;
    expect(nrgs.address).to.be.properAddress;

    expect(await mcgr.name()).to.be.eq(`Mictrogrid Reward token`);
    expect(await mcgr.symbol()).to.be.eq(`MCGR`);
    expect(await elu.name()).to.be.eq(`Electricity user token`);
    expect(await elu.symbol()).to.be.eq(`ELU`);
    expect(await nrgs.name()).to.be.eq(`Energy Supply token`);
    expect(await nrgs.symbol()).to.be.eq(`NRGS`);

    admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
    minter_role = await mcgr.MINTER_ROLE();
    burner_role = await mcgr.BURNER_ROLE();

    expect(await mcgr.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await mcgr.hasRole(burner_role, deployer.address)).to.be.true;
    expect(await elu.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await elu.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await elu.hasRole(burner_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(admin_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(minter_role, deployer.address)).to.be.true;
    expect(await nrgs.hasRole(burner_role, deployer.address)).to.be.true;
  });

  describe(`MCGR`, function () {
    it('MCGR can be minted only by mint manager', async () => {
      const { mcgr, otherAcc } = await loadFixture(deployFixture);

      await expect(mcgr.connect(otherAcc).mint(otherAcc.address, 10)).to.be.revertedWith(`AccessControl: account ${otherAccAddress} is missing role ${minter_role}`);
      expect(await mcgr.mint(otherAcc.address, 10)).to.changeTokenBalance(mcgr, otherAcc, 10);
    });

    it('MCGR can be burned only by burn manager', async () => {
      const { mcgr, otherAcc } = await loadFixture(deployFixture);

      await mcgr.mint(otherAcc.address, 10);

      await expect(mcgr.connect(otherAcc).burn(otherAcc.address, 10)).to.be.revertedWith(`AccessControl: account ${otherAccAddress} is missing role ${burner_role}`);
      expect(await mcgr.burn(otherAcc.address, 10)).to.changeTokenBalance(mcgr, otherAcc, -10);
    });
  });

  describe(`NRGS`, function () {
    it('NRGS can be minted only by mint manager', async () => {
      const { nrgs, otherAcc } = await loadFixture(deployFixture);

      await expect(nrgs.connect(otherAcc).mint(otherAcc.address, 0)).to.be.revertedWith(`AccessControl: account ${otherAccAddress} is missing role ${minter_role}`);
      expect(await nrgs.mint(otherAcc.address, 0)).to.changeTokenBalance(nrgs, otherAcc, 1);
    });

    it('NRGS can be burned only by burn manager', async () => {
      const { nrgs, otherAcc } = await loadFixture(deployFixture);

      await nrgs.mint(otherAcc.address, 0);

      await expect(nrgs.connect(otherAcc).burn(0)).to.be.revertedWith(`AccessControl: account ${otherAccAddress} is missing role ${burner_role}`);
      expect(await nrgs.burn(0)).to.changeTokenBalance(nrgs, otherAcc, -1);
    });
  });

  describe(`ELU`, function () {
    it('ELU can add user to supplier', async () => {
      const { elu, otherAcc, deployer } = await loadFixture(deployFixture);

      expect(await elu.mint(otherAcc.address, 0, deployer.address)).to.changeTokenBalance(elu, otherAcc, 1);
      expect(await elu.userToSupplier(otherAcc.address)).to.eq(deployer.address);
    });

    it('ELU after burning deletes userToSupplier', async () => {
      const { elu, otherAcc, deployer } = await loadFixture(deployFixture);

      expect(await elu.mint(otherAcc.address, 0, deployer.address)).to.changeTokenBalance(elu, otherAcc, 1);
      expect(await elu.userToSupplier(otherAcc.address)).to.eq(deployer.address);
      expect(await elu.burn(0)).to.changeTokenBalance(elu, otherAcc, -1);
      expect(await elu.userToSupplier(otherAcc.address)).to.eq(ethers.constants.AddressZero);
    });

    it('ELU can be minted only by mint manager', async () => {
      const { elu, otherAcc } = await loadFixture(deployFixture);

      await expect(elu.connect(otherAcc).mint(otherAcc.address, 0, otherAcc.address)).to.be.revertedWith(`AccessControl: account ${otherAccAddress} is missing role ${minter_role}`);
      expect(await elu.mint(otherAcc.address, 0, otherAcc.address)).to.changeTokenBalance(elu, otherAcc, 1);
    });

    it('ELU can be burned only by burn manager', async () => {
      const { elu, otherAcc } = await loadFixture(deployFixture);

      await elu.mint(otherAcc.address, 0, otherAcc.address);

      await expect(elu.connect(otherAcc).burn(0)).to.be.revertedWith(`AccessControl: account ${otherAccAddress} is missing role ${burner_role}`);
      expect(await elu.burn(0)).to.changeTokenBalance(elu, otherAcc, -1);
    });
  });

});
