# Solidity API

## MainMock

### escrow

```solidity
contract IEscrow escrow
```

### mcgr

```solidity
contract IMCGR mcgr
```

### constructor

```solidity
constructor(contract IEscrow _escrow, contract IMCGR _mcgr) public
```

### send

```solidity
function send(address user, uint256 tokenId, uint256 paidAmount) public
```

