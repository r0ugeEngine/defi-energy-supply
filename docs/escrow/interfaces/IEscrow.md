# Solidity API

## IEscrow

_Interface for the Escrow contract._

### sendFundsToSupplier

```solidity
function sendFundsToSupplier(address user, uint256 supplierId, uint256 paidAmount) external
```

_Sends funds to the supplier for the energy consumed by a user.
Requirements:
- `msg.sender` must have `ESCROW_MANAGER_ROLE`
- `paidAmount` must be > 0
- `user` must be not address 0_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| user | address | The address of the user. |
| supplierId | uint256 | The ID of the token. |
| paidAmount | uint256 | The amount of funds sent by the user. |

