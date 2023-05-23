// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

abstract contract TokenRoles {
    bytes32 public constant MINTER_ROLE = keccak256(bytes("MINTER_ROLE"));
    bytes32 public constant BURNER_ROLE = keccak256(bytes("BURNER_ROLE"));
}
