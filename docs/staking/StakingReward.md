# Solidity API

## StakingReward

### EnterStaking

```solidity
event EnterStaking(address sender, address supplier, uint256 timestamp)
```

_Emmited when a user registers as an Energy supplier_

### ExitStaking

```solidity
event ExitStaking(address sender, address supplier, uint256 timestamp)
```

_Emmited when a user unregisters as an Energy supplier_

### RewardSent

```solidity
event RewardSent(address sender, address to, uint256 amount)
```

_Emitted when a supplier withdraws some amount of rewards from `StakingReward`_

### Supplier

```solidity
struct Supplier {
  uint256 updatedAt;
  uint256 pendingReward;
}
```

### STAKING_MANAGER_ROLE

```solidity
bytes32 STAKING_MANAGER_ROLE
```

_Keccak256 hashed `STAKING_MANAGER_ROLE` string_

### totalSuppliers

```solidity
uint256 totalSuppliers
```

_Total suppliers_

### suppliers

```solidity
mapping(address => mapping(uint256 => struct StakingReward.Supplier)) suppliers
```

_Address to supplier_

### isCorrectOwner

```solidity
modifier isCorrectOwner(address supplier, uint256 tokenId)
```

_Throws if passed not correct owner of tokenId_

### constructor

```solidity
constructor(contract IManager _manager) public
```

Constructor to initialize StakingReward contract

_Grants `DEFAULT_ADMIN_ROLE` and `STAKING_MANAGER_ROLE` roles to `msg.sender`_

### enterStaking

```solidity
function enterStaking(address supplier, uint256 tokenId) external
```

Enters staking process.
Requirements:
- `msg.sender` must have STAKING_MANAGER_ROLE
- `supplier` must not be address 0
- `supplier` must have NRGS token

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplier | address | address |
| tokenId | uint256 | uint256 |

### sendRewards

```solidity
function sendRewards(address supplier, uint256 tokenId) external
```

Sends rewards to suppliers.
Requirements:
- `msg.sender` must have STAKING_MANAGER_ROLE
- `supplier` must be in staking

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplier | address | address |
| tokenId | uint256 | uint256 |

### exitStaking

```solidity
function exitStaking(address supplier, uint256 tokenId) external
```

Exits staking.
Requirements:
- `msg.sender` must have STAKING_MANAGER_ROLE
- `supplier` must be in staking

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplier | address | address |
| tokenId | uint256 | uint256 |

### updateRewards

```solidity
function updateRewards(address supplier, uint256 tokenId) public returns (struct StakingReward.Supplier)
```

Updates rewards for `supplier`.
Requirements:
- `supplier` must be in staking

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| supplier | address | address |
| tokenId | uint256 | uint256 |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct StakingReward.Supplier | Supplier memory |

