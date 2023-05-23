// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "../TokenRoles.sol";

/**
 * @title Template for NFT tokens
 * @author Bohdan
 */
contract NFTTemplate is TokenRoles, ERC721, AccessControl {
    /// @dev Total amount of tokens
    uint256 public totalTokens;

    /// @notice Constructor to initialize NFT token contract
    /// @dev Grants each roles to `msg.sender`
    /// @dev Sets `name` and `symbol` of ERC721 token
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
    }

    /// @dev Mints `to` address NRGS token
    /// @param to address to mint
    function mint(address to, uint256 tokenId) public onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
        totalTokens++;
    }

    /// @dev Burns `from` address NRGS token
    /// @param tokenId uint256
    function burn(uint256 tokenId) public virtual onlyRole(BURNER_ROLE) {
        _burn(tokenId);
        totalTokens--;
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
