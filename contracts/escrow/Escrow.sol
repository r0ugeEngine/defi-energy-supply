// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "../manager/interfaces/IManager.sol";

contract Escrow is AccessControl {
    using SafeERC20 for IERC20;
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

    function sendFundsToSupplier(
        address user,
        address supplier,
        uint256 tokenId,
        uint256 paidAmount
    ) public onlyRole(ESCROW_MANAGER_ROLE) {
        require(manager.ELU().userToSupplier(user, tokenId) == supplier, "Escrow: user connected to another supplier");
        require(
            paidAmount >= manager.oracle().getEnergyConsumption(user, tokenId) + manager.fees(),
            "Escrow: not enough funds sent"
        );

        uint amountRemaining = paidAmount - manager.oracle().getEnergyConsumption(user, tokenId) - manager.fees();

        require(
            manager.MCGR().transfer(supplier, manager.oracle().getEnergyConsumption(user, tokenId)),
            "Escrow: transfer to supplier failed"
        );

        require(
            manager.MCGR().transfer(manager.feeReceiver(), manager.fees()),
            "Escrow: transfer to fee receiver failed"
        );

        require(manager.MCGR().transfer(user, amountRemaining), "Escrow: transfer to fee receiver failed");
    }
}
