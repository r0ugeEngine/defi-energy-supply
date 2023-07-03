# Solidity API

## Parent

### manager

```solidity
contract IManager manager
```

_Manager contract_

### gtZero

```solidity
modifier gtZero(uint256 value)
```

_Throws if passed value is <= 0_

### zeroAddressCheck

```solidity
modifier zeroAddressCheck(address account)
```

_Throws if passed address 0 as parameter_

### constructor

```solidity
constructor(contract IManager _manager) internal
```

Constructor to initialize Parent contract.

_Sets `manager` link._

### changeManager

```solidity
function changeManager(contract IManager _newManager) external
```

_Changes `manager` address to the `_newManager` address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newManager | contract IManager | The address of the new manger contract |

