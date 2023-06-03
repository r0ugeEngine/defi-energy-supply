// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../manager/interfaces/IManager.sol";

/**
 * @title Escrow
 * @dev A contract for managing energy payments and transfers between users and suppliers.
 * @author Bohdan
 */
contract Escrow is AccessControl {
    ///@dev Emmited when a user paid for energy
    event PaidForEnergy(address indexed user, uint256 indexed tokenId, address indexed supplier, uint256 amount);

    /// @dev Keccak256 hashed `ESCROW_MANAGER_ROLE` string
    bytes32 public constant ESCROW_MANAGER_ROLE = keccak256(bytes("ESCROW_MANAGER_ROLE"));

    /// @dev Manager contract
    IManager public manager;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address account) {
        require(account != address(0), "Escrow: account is address 0");
        _;
    }

    /// @dev Throws if passed value is <= 0
    modifier gtZero(uint256 value) {
        require(value > 0, "Escrow: passed value is <= 0");
        _;
    }

    /**
     * @notice Constructor to initialize the Escrow contract
     * @param _manager The address of the Manager contract.
     * @dev Grants `DEFAULT_ADMIN_ROLE` and `ESCROW_MANAGER_ROLE` roles to the contract deployer.
     */
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ESCROW_MANAGER_ROLE, msg.sender);
        manager = _manager;
    }

    /**
     * @dev Sends funds to the supplier for the energy consumed by a user.
     * Requirements:
     * - `msg.sender` must have `ESCROW_MANAGER_ROLE`
     * - `paidAmount` must be > 0
     * - `user` must be not address 0
     * - `supplier` must be not address 0
     *
     * @param user The address of the user.
     * @param supplierId The ID of the token.
     * @param supplier The address of the supplier.
     * @param paidAmount The amount of funds sent by the user.
     */
    function sendFundsToSupplier(
        address user,
        uint256 supplierId,
        address supplier,
        uint256 paidAmount
    ) public onlyRole(ESCROW_MANAGER_ROLE) zeroAddressCheck(user) zeroAddressCheck(supplier) gtZero(paidAmount) {
        uint256 consumption = manager.oracle().getEnergyConsumption(user, supplierId);
        uint256 needToBePaid = consumption + manager.fees();

        require(manager.ELU().balanceOf(user, supplierId) > 0, "Escrow: user connected to another supplier");

        require(paidAmount >= needToBePaid, "Escrow: not enough funds sent");

        uint256 amountRemaining = paidAmount - needToBePaid;

        require(manager.MCGR().transfer(supplier, consumption), "Escrow: transfer to supplier failed");

        require(
            manager.MCGR().transfer(manager.feeReceiver(), manager.fees()),
            "Escrow: transfer to fee receiver failed"
        );

        if (amountRemaining > 0) {
            require(manager.MCGR().transfer(user, amountRemaining), "Escrow: transfer to user failed");
        }

        emit PaidForEnergy(user, supplierId, supplier, consumption);
    }
}
