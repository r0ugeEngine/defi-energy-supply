// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../manager/interfaces/IManager.sol";

/**
 * @title Main
 * @dev A main contract for managing Microgrid ecosytem.
 * @author Bohdan
 */
contract Main is AccessControl {
    /// @dev Keccak256 hashed `MAIN_MANAGER_ROLE` string
    bytes32 public constant MAIN_MANAGER_ROLE = keccak256(bytes("MAIN_MANAGER_ROLE"));

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
     * @dev Grants `DEFAULT_ADMIN_ROLE` and `MAIN_MANAGER_ROLE` roles to the contract deployer.
     */
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MAIN_MANAGER_ROLE, msg.sender);
        manager = _manager;
    }

    function registerSupplier(uint256 supplierId, uint256 buildingsNumber) external {
        manager.register().registerSupplier(msg.sender, supplierId, buildingsNumber);
    }

    function registerElectricityUser(uint256 supplierId, address supplier) external {
        manager.register().registerElectricityUser(msg.sender, supplierId, supplier);
    }

    function unRegisterSupplier(uint256 supplierId) external {
        manager.register().unRegisterSupplier(msg.sender, supplierId);
    }

    function unRegisterElectricityUser(uint256 supplierId) external {
        manager.register().unRegisterElectricityUser(msg.sender, supplierId);
    }

    function payForElectricity(uint256 supplierId, address supplier, uint256 amountToPay) external {
        manager.escrow().sendFundsToSupplier(msg.sender, supplierId, supplier, amountToPay);
    }

    function getRewards(uint256 supplierId) external {
        manager.staking().sendRewards(msg.sender, supplierId);
    }
}
