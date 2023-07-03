# Solidity API

## IStakingReward

### Supplier

```solidity
struct Supplier {
  uint256 updatedAt;
  uint256 pendingReward;
}
```

### suppliers

```solidity
function suppliers(address supplier, uint256 tokenId) external view returns (struct IStakingReward.Supplier)
```

_Address to supplier_

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
function updateRewards(address supplier, uint256 tokenId) external returns (struct IStakingReward.Supplier)
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
| [0] | struct IStakingReward.Supplier | Supplier memory |

