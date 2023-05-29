// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../manager/interfaces/IManager.sol";

contract Escrow is AccessControl {
    /// @dev Keccak256 hashed `ESCROW_MANAGER_ROLE` string
    bytes32 public constant ESCROW_MANAGER_ROLE = keccak256(bytes("ESCROW_MANAGER_ROLE"));

    /// @dev Manager contract
    IManager manager;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address account) {
        require(account != address(0), "Escrow: supplier is address 0");
        _;
    }

    /// @notice Constructor to initialize StakingManagement contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `ESCROW_MANAGER_ROLE` roles to `msg.sender`
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ESCROW_MANAGER_ROLE, msg.sender);
        manager = _manager;
    }
}
