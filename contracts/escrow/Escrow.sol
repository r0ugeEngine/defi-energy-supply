// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../manager/interfaces/IManager.sol";

contract Escrow is AccessControl {
    ///@dev Emmited when an user paid for energy
    event PaidForEnergy(address indexed user, uint256 indexed tokenId, address indexed supplier, uint256 amount);

    /// @dev Keccak256 hashed `ESCROW_MANAGER_ROLE` string
    bytes32 public constant ESCROW_MANAGER_ROLE = keccak256(bytes("ESCROW_MANAGER_ROLE"));

    /// @dev Manager contract
    IManager manager;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address account) {
        require(account != address(0), "Escrow: account is address 0");
        _;
    }

    /// @dev Throws if passed value is <=0
    modifier gtZero(uint256 value) {
        require(value > 0, "Escrow: passed value is <= 0");
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
        uint256 tokenId,
        address supplier,
        uint256 paidAmount
    ) public onlyRole(ESCROW_MANAGER_ROLE) zeroAddressCheck(user) zeroAddressCheck(supplier) gtZero(paidAmount) {
        uint consumption = manager.oracle().getEnergyConsumption(user, tokenId);
        uint needToBePaid = consumption + manager.fees();

        require(manager.ELU().userToSupplier(user, tokenId) == supplier, "Escrow: user connected to another supplier");
        require(paidAmount >= needToBePaid, "Escrow: not enough funds sent");

        uint amountRemaining = paidAmount - needToBePaid;

        require(manager.MCGR().transfer(supplier, consumption), "Escrow: transfer to supplier failed");

        require(
            manager.MCGR().transfer(manager.feeReceiver(), manager.fees()),
            "Escrow: transfer to fee receiver failed"
        );

        if (amountRemaining > 0) {
            require(manager.MCGR().transfer(user, amountRemaining), "Escrow: transfer to fee receiver failed");
        }

        emit PaidForEnergy(user, tokenId, supplier, consumption);
    }
}
