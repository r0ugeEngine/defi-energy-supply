import hre, { ethers } from 'hardhat';
import { ELU, EnergyOracle, Escrow, MCGR, Main, Manager, NRGS, Register, StakingReward } from '../typechain';

const Main = '0xcF81B08cbCa47fcbB4669c002774c7C405AD67dD'
const Manager = '0x61E0e280B1E05FCEfb684dd729cDe782fd98cd40';
const Register = '0xE59474b146d750022c5E3C9376d74D0Ca31D7008'

const ELU = '0xd31f9437602E985c19a3Ee11B35d76F5d1DA4235';
const MCGR = '0x2F176C9145DF9943f7ad31E4DEFC1290bDe54D32';
const NRGS = '0xCd144d7bfE80D0300F1Ec64CbFc97109777F15Bc';

const Escrow = '0x26367A9c65d9627EFd0c5eb62B984A13941aaBb6'
const EnergyOracle = '0xB99B7a11B0e6BF8F0220f7C4E9Bd5BA37d195da5'
const StakingReward = '0xeCC73646565e17C253f230215a125E175476566b'

let admin_role: string, minter_role: string, escrow_manager: string, register_role: string, energy_oracle_manager_role: string, oracle_provider_role: string, _escrow_: string, register_manger_role: string, staking_manager_role: string, main_manager_role: string, supplier_role: string, user_role: string;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer: ', deployer.address);

  const mcgr: MCGR = await ethers.getContractAt('MCGR', MCGR);
  const nrgs: NRGS = await ethers.getContractAt('NRGS', NRGS);
  const elu: ELU = await ethers.getContractAt('ELU', ELU);

  const main: Main = await ethers.getContractAt('Main', Main);
  const register: Register = await ethers.getContractAt('Register', Register);
  const manager: Manager = await ethers.getContractAt('Manager', Manager);

  const escrow: Escrow = await ethers.getContractAt('Escrow', Escrow);
  const oracle: EnergyOracle = await ethers.getContractAt('EnergyOracle', EnergyOracle);
  const stakingReward: StakingReward = await ethers.getContractAt('StakingReward', StakingReward);


  console.log("Manager set up");
  await manager.changeOracle(oracle.address);
  await manager.changeRegister(register.address);
  await manager.changeEscrow(escrow.address);
  await manager.changeStakingContract(stakingReward.address);
  console.log("Done");

  admin_role = await mcgr.DEFAULT_ADMIN_ROLE();
  minter_role = await mcgr.MINTER_BURNER_ROLE();

  register_role = await nrgs.REGISTER_ROLE();

  escrow_manager = await escrow.ESCROW_MANAGER_ROLE();

  energy_oracle_manager_role = await oracle.ENERGY_ORACLE_MANAGER_ROLE();
  oracle_provider_role = await oracle.ORACLE_PROVIDER_ROLE();
  _escrow_ = await oracle.ESCROW();

  register_manger_role = await register.REGISTER_MANAGER_ROLE();

  staking_manager_role = await stakingReward.STAKING_MANAGER_ROLE();

  main_manager_role = await main.MAIN_MANAGER_ROLE();
  supplier_role = await main.SUPPLIER_ROLE();
  user_role = await main.USER_ROLE();

  console.log("Granting roles")
  await register.grantRole(register_manger_role, main.address);
  await escrow.grantRole(escrow_manager, main.address);
  await stakingReward.grantRole(staking_manager_role, main.address);
  await stakingReward.grantRole(staking_manager_role, register.address);
  await oracle.grantRole(oracle_provider_role, main.address);
  await oracle.grantRole(_escrow_, escrow.address);

  await elu.grantRole(register_role, register.address);
  await nrgs.grantRole(register_role, register.address);
  await mcgr.grantRole(minter_role, stakingReward.address);
  await mcgr.grantRole(minter_role, oracle.address);
  console.log("Done");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
