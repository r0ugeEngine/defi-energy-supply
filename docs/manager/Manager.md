# Solidity API

## Manager

_This contract manages the links to various contracts and stores configuration values for the system._

### MCGRchanged

```solidity
event MCGRchanged(address sender, contract IMCGR newMCGR)
```

_Emitted when a manager has changed the `MCGR` link to another contract_

### ELUchanged

```solidity
event ELUchanged(address sender, contract IELU newELU)
```

_Emitted when a manager has changed the `ELU` link to another contract_

### NRGSchanged

```solidity
event NRGSchanged(address sender, contract INRGS newNRGS)
```

_Emitted when a manager has changed the `NRGS` link to another contract_

### StakingChanged

```solidity
event StakingChanged(address sender, contract IStakingReward staking)
```

_Emitted when a manager has changed the `staking` link to another contract_

### OracleChanged

```solidity
event OracleChanged(address sender, contract IEnergyOracle oracle)
```

_Emitted when a manager has changed the `oracle` link to another contract_

### RegisterChanged

```solidity
event RegisterChanged(address sender, contract IRegister register)
```

_Emitted when a manager has changed the `register` link to another contract_

### EscrowChanged

```solidity
event EscrowChanged(address sender, contract IEscrow escrow)
```

_Emitted when a manager has changed the `escrow` link to another contract_

### FeeReceiverChanged

```solidity
event FeeReceiverChanged(address sender, address newReceiver)
```

_Emitted when a manager has changed the `feeReceiver` link to another address_

### RewardAmountChanged

```solidity
event RewardAmountChanged(address sender, uint256 newRewardAmount)
```

_Emitted when a manager has changed the `rewardAmount`_

### ToleranceChanged

```solidity
event ToleranceChanged(address sender, uint256 newTolerance)
```

_Emitted when a manager has changed the `tolerance`_

### FeesChanged

```solidity
event FeesChanged(address sender, uint256 newFees)
```

_Emitted when a manager has changed the `fees`_

### MANAGER_ROLE

```solidity
bytes32 MANAGER_ROLE
```

_Keccak256 hashed `MANAGER_ROLE` string_

### MCGR

```solidity
contract IMCGR MCGR
```

_Reward token_

### ELU

```solidity
contract IELU ELU
```

_Electricity user NFT token_

### NRGS

```solidity
contract INRGS NRGS
```

_Energy Supplier NFT token_

### staking

```solidity
contract IStakingReward staking
```

_Staking contract_

### oracle

```solidity
contract IEnergyOracle oracle
```

_Oracle contract_

### register

```solidity
contract IRegister register
```

_Register contract_

### escrow

```solidity
contract IEscrow escrow
```

_Escrow contract_

### feeReceiver

```solidity
address feeReceiver
```

_Address where fees will be paid_

### rewardAmount

```solidity
uint256 rewardAmount
```

_Amount of rewards to suppliers_

### tolerance

```solidity
uint256 tolerance
```

_Tolerance for equality_

### fees

```solidity
uint256 fees
```

_Fees for payments to creators_

### zeroAddressCheck

```solidity
modifier zeroAddressCheck(address supplier)
```

_Throws if passed address 0 as parameter_

### gtZero

```solidity
modifier gtZero(uint256 value)
```

_Throws if passed value is <=0_

### constructor

```solidity
constructor(contract IMCGR _MCGR, contract IELU _ELU, contract INRGS _NRGS, address _feeReceiver, uint256 _rewardAmount, uint256 _tolerance, uint256 _fees) public
```

Constructor to initialize the Manager contract

_Grants `DEFAULT_ADMIN_ROLE` and `MANAGER_ROLE` roles to `msg.sender`
Sets `MCGR` token address, `ELU` and `NRGS` tokens addresses, `staking` address
Sets `feeReceiver` address
Sets `rewardAmount`, `tolerance`, and `fees`_

### changeMCGR

```solidity
function changeMCGR(contract IMCGR _MCGR) external
```

Changes MCGR link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_MCGR` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _MCGR | contract IMCGR | IMCGR |

### changeNRGS

```solidity
function changeNRGS(contract INRGS _NRGS) external
```

Changes NRGS link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_NRGS` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _NRGS | contract INRGS | INRGS |

### changeELU

```solidity
function changeELU(contract IELU _ELU) external
```

Changes ELU link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_ELU` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _ELU | contract IELU | IELU |

### changeStakingContract

```solidity
function changeStakingContract(contract IStakingReward _staking) external
```

Changes `staking` link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_staking` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _staking | contract IStakingReward | IStakingReward |

### changeOracle

```solidity
function changeOracle(contract IEnergyOracle _oracle) external
```

Changes `oracle` link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_oracle` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _oracle | contract IEnergyOracle | IEnergyOracle |

### changeRegister

```solidity
function changeRegister(contract IRegister _register) external
```

Changes `register` link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_register` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _register | contract IRegister | IRegister |

### changeEscrow

```solidity
function changeEscrow(contract IEscrow _escrow) external
```

Changes `escrow` link to another contract.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_escrow` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _escrow | contract IEscrow | IEscrow |

### changeFeeReceiver

```solidity
function changeFeeReceiver(address _newFeeReceiver) external
```

Changes `feeReceiver` link to another address.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_newFeeReceiver` must be not address 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newFeeReceiver | address | address |

### changeRewardAmount

```solidity
function changeRewardAmount(uint256 _newRewardAmount) external
```

Changes reward amount to another amount.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_newRewardAmount` must be > 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newRewardAmount | uint256 | uint256 |

### changeTolerance

```solidity
function changeTolerance(uint256 _newTolerance) external
```

Changes tolerance amount to another amount.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_newTolerance` must be > 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newTolerance | uint256 | uint256 |

### changeFees

```solidity
function changeFees(uint256 _newFees) external
```

Changes fees amount to another amount.
Requirements:
- `msg.sender` must have `MANAGER_ROLE`
- `_newFees` must be > 0

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newFees | uint256 | uint256 |

