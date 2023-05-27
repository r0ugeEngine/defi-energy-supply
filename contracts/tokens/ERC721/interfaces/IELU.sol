// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./INFTTemplate.sol";

/**
 * @title Interface for Electricity user token contract (ERC721 standard).
 * @author Bohdan
 */
interface IELU is INFTTemplate {
    /// @dev Mints `to` address ELU token
    /// @param to address to mint
    function mint(address to, uint256 tokenId, address supplier) external;

    /// @dev Burns `from` address ELU token
    /// @param tokenId uint256
    function burn(uint256 tokenId) external;
}
