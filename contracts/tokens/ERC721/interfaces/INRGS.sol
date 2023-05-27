// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./INFTTemplate.sol";

/**
 * @title Interface for Energy Supply token contract (ERC721 standard)
 * @author Bohdan
 */
interface INRGS is INFTTemplate {
    /// @dev Mints `to` address NRGS token
    /// @param to address to mint
    function mint(address to, uint256 tokenId) external;

    /// @dev Burns `from` address NRGS token
    /// @param tokenId uint256
    function burn(uint256 tokenId) external;
}
