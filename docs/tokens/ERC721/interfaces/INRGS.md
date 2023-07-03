# Solidity API

## INRGS

### totalTokens

```solidity
function totalTokens() external view returns (uint256)
```

_Total amount of tokens_

### mint

```solidity
function mint(address to, uint256 tokenId) external
```

_Mints `to` address NRGS token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| to | address | address to mint |
| tokenId | uint256 |  |

### burn

```solidity
function burn(uint256 tokenId) external
```

_Burns `from` address NRGS token_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenId | uint256 | uint256 |

### balanceOf

```solidity
function balanceOf(address owner) external view returns (uint256)
```

_See {IERC721-balanceOf}._

### ownerOf

```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```

_See {IERC721-ownerOf}._

