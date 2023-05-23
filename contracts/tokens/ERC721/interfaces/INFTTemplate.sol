// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title Interface for Template for NFT tokens contract
 * @author Bohdan
 */
interface INFTTemplate is IERC721, IAccessControl {
    /// @dev Total amount of tokens
    function totalTokens() external view returns (uint256);
}
