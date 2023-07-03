# Solidity API

## Main

_A main contract for managing Microgrid ecosystem._

### MAIN_MANAGER_ROLE

```solidity
bytes32 MAIN_MANAGER_ROLE
```

_Keccak256 hashed `MAIN_MANAGER_ROLE` string_

### SUPPLIER_ROLE

```solidity
bytes32 SUPPLIER_ROLE
```

_Keccak256 hashed `SUPPLIER_ROLE` string_

### USER_ROLE

```solidity
bytes32 USER_ROLE
```

_Keccak256 hashed `USER_ROLE` string_

### constructor

```solidity
constructor(contract IManager _manager) public
```

Constructor to initialize the Main contract.

_Grants `DEFAULT_ADMIN_ROLE`, `MAIN_MANAGER_ROLE`,`SUPPLIER_ROLE` and `USER_ROLE` roles to the contract deployer._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _manager | contract IManager | The address of the Manager contract. |

### registerSupplier

```solidity
function registerSupplier(address supplier, uint256 supplierId, uint256 buildingsNumber) external
```

Registers an Energy supplier.
Requirements:
- `supplierId` must be greater than 0.
- `buildingsNumber` must be greater than 0.
- `msg.sender` must have `MAIN_MANAGER_ROLE`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplier | address |  |
| supplierId | uint256 | The ID of the supplier. |
| buildingsNumber | uint256 | The number of buildings for the supplier. |

### registerElectricityUser

```solidity
function registerElectricityUser(address user, uint256 supplierId) external
```

Registers an Electricity user.
Requirements:
- `supplierId` must be greater than 0.
- `msg.sender` must have `SUPPLIER_ROLE`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address |  |
| supplierId | uint256 | The ID of the supplier. |

### unRegisterSupplier

```solidity
function unRegisterSupplier(uint256 supplierId) external
```

Unregisters an Energy supplier.
Requirements:
- `supplierId` must be greater than 0.
- `msg.sender` must have `MAIN_MANAGER_ROLE`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplierId | uint256 | The ID of the supplier. |

### unRegisterElectricityUser

```solidity
function unRegisterElectricityUser(address user, uint256 supplierId) external
```

Unregisters an Electricity user.
Requirements:
- `supplierId` must be greater than 0.
- `msg.sender` must have `USER_ROLE`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address |  |
| supplierId | uint256 | The ID of the supplier. |

### payForElectricity

```solidity
function payForElectricity(uint256 supplierId, uint256 amountToPay) external
```

Pays for electricity.
Requirements:
- `supplierId` must be greater than 0.
- `amountToPay` must be greater than 0.
- `msg.sender` must have `USER_ROLE`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplierId | uint256 | The ID of the supplier. |
| amountToPay | uint256 | The amount to pay for electricity. |

### getRewards

```solidity
function getRewards(uint256 supplierId) external
```

Gets the rewards for a supplier.
Requirements:
- `supplierId` must be greater than 0.
- `msg.sender` must have `SUPPLIER_ROLE`.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplierId | uint256 | The ID of the supplier. |

