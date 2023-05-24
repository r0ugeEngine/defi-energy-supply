// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

/**
 * @title IMCGR interface of MCGR contract
 * Can be used as staking reward token, or rewards for Oracle makers.
 * @author Bohdan
 */
interface IMCGR {
    /**
     * @dev Mints `to` address some `amount` of tokens
     * Requirements:
     * - only `MINTER_ROLE`
     *
     * @param to address to mint
     * @param amount of tokens to mint
     */
    function mint(address to, uint256 amount) external;

    /**
     * @dev Burns `from` address some `amount` of tokens
     * Requirements:
     * - only `BURNER_ROLE`
     *
     * @param from address to mint
     * @param amount of tokens to burn
     */
    function burn(address from, uint256 amount) external;
}
