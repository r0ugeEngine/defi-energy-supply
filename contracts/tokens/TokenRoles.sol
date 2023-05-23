// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Abstract contract for tokens' roles
 * @author Bohdan
 */
abstract contract TokenRoles {
    /// @dev Keccak256 hashed `MINTER_ROLE` string
    bytes32 public constant MINTER_ROLE = keccak256(bytes("MINTER_ROLE"));
    /// @dev Keccak256 hashed `BURNER_ROLE` string
    bytes32 public constant BURNER_ROLE = keccak256(bytes("BURNER_ROLE"));
}
