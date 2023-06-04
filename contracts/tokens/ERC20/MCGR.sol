// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title MCGR token contract
 * Can be used as staking reward token, or rewards for Oracle makers.
 * @author Bohdan
 */
contract MCGR is ERC20, AccessControl {
    /// @dev Keccak256 hashed `MINTER_BURNER_ROLE` string
    bytes32 public constant MINTER_BURNER_ROLE = keccak256(bytes("MINTER_ROLE"));

    /// @notice Constructor to initialize ERC20 token contract
    /// @dev Grants each roles to `msg.sender`
    /// @dev Sets `name` and `symbol` of ERC20 token
    constructor() ERC20("Mictrogrid Reward token", "MCGR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_BURNER_ROLE, msg.sender);
    }

    /**
     * @dev Mints `to` address some `amount` of tokens
     * Requirements:
     * - only `MINTER_ROLE`
     *
     * @param to address to mint
     * @param amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_BURNER_ROLE) {
        _mint(to, amount);
    }

    /**
     * @dev Burns `from` address some `amount` of tokens
     * Requirements:
     * - only `BURNER_ROLE`
     *
     * @param from address to mint
     * @param amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyRole(MINTER_BURNER_ROLE) {
        _burn(from, amount);
    }
}
