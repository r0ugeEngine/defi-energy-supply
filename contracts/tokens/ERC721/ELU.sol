// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./NFTTemplate.sol";

/**
 * @title Electricity user token contract (ERC721 standard).
 * @author Bohdan
 */
contract ELU is NFTTemplate {
    /// @dev Linked NRGS token address as interface.
    IERC721 public NRGS;

    /// @dev Linked users to suppliers.
    mapping(address => address) public userToSupplier;

    /**
     * @notice Constructor to initialize ELU contract.
     * @dev Grants each roles to `msg.sender`.
     * Sets `name` and `symbol` of ERC721 token.
     * Sets `NRGS` token link.
     */
    constructor(IERC721 _NRGS) NFTTemplate("Electricity user token", "ELU") {
        NRGS = _NRGS;
    }

    /// @dev Mints `to` address NRGS token
    /// @param to address to mint
    function mint(address to, uint256 tokenId, address supplier) external {
        mint(to, tokenId);
        userToSupplier[to] = supplier;
    }

    /// @dev Burns `from` address NRGS token
    /// @param tokenId uint256
    function burn(uint256 tokenId) public override {
        address owner = ownerOf(tokenId);
        super.burn(tokenId);
        delete userToSupplier[owner];
    }
}
