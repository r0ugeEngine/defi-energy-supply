// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./NFTTemplate.sol";

/**
 * @title Electricity user token contract (ERC721 standard).
 * @author Bohdan
 */
contract ELU is NFTTemplate {
    /// @dev Linked users to suppliers.
    mapping(address => address) public userToSupplier;

    /**
     * @notice Constructor to initialize ELU contract.
     * @dev Grants each roles to `msg.sender`.
     * Sets `name` and `symbol` of ERC721 token.
     * Sets `NRGS` token link.
     */
    constructor() NFTTemplate("Electricity user token", "ELU") {}

    /// @dev Mints `to` address ELU token
    /// @param to address to mint
    function mint(address to, uint256 tokenId, address supplier) external onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
        userToSupplier[to] = supplier;
    }

    /// @dev Burns `from` address ELU token
    /// @param tokenId uint256
    function burn(uint256 tokenId) public onlyRole(BURNER_ROLE) {
        address owner = ownerOf(tokenId);
        _burn(tokenId);
        delete userToSupplier[owner];
    }
}
