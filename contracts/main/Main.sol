// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../manager/interfaces/IManager.sol";

/**
 * @title Main
 * @dev A main contract for managing Microgrid ecosystem.
 * @author Bohdan
 */
contract Main is AccessControl {
    /// @dev Keccak256 hashed `MAIN_MANAGER_ROLE` string
    bytes32 public constant MAIN_MANAGER_ROLE = keccak256(bytes("MAIN_MANAGER_ROLE"));

    /// @dev Manager contract
    IManager public manager;

    /// @dev Throws if passed value is <= 0
    modifier gtZero(uint256 value) {
        require(value > 0, "Main: value is <= 0");
        _;
    }

    /**
     * @notice Constructor to initialize the Main contract.
     * @param _manager The address of the Manager contract.
     * @dev Grants `DEFAULT_ADMIN_ROLE` and `MAIN_MANAGER_ROLE` roles to the contract deployer.
     */
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MAIN_MANAGER_ROLE, msg.sender);
        manager = _manager;
    }

    /**
     * @notice Registers an Energy supplier.
     * Requirements:
     * - `supplierId` must be greater than 0.
     * - `buildingsNumber` must be greater than 0.
     *
     * @param supplierId The ID of the supplier.
     * @param buildingsNumber The number of buildings for the supplier.
     */
    function registerSupplier(uint256 supplierId, uint256 buildingsNumber) external gtZero(buildingsNumber) {
        manager.register().registerSupplier(msg.sender, supplierId, buildingsNumber);
    }

    /**
     * @notice Registers an Electricity user.
     * Requirements:
     * - `supplierId` must be greater than 0.
     *
     * @param supplierId The ID of the supplier.
     */
    function registerElectricityUser(uint256 supplierId) external {
        manager.register().registerElectricityUser(msg.sender, supplierId);
    }

    /**
     * @notice Unregisters an Energy supplier.
     * Requirements:
     * - `supplierId` must be greater than 0.
     *
     * @param supplierId The ID of the supplier.
     */
    function unRegisterSupplier(uint256 supplierId) external {
        manager.register().unRegisterSupplier(msg.sender, supplierId);
    }

    /**
     * @notice Unregisters an Electricity user.
     * Requirements:
     * - `supplierId` must be greater than 0.
     *
     * @param supplierId The ID of the supplier.
     */
    function unRegisterElectricityUser(uint256 supplierId) external {
        manager.register().unRegisterElectricityUser(msg.sender, supplierId);
    }

    /**
     * @notice Pays for electricity.
     * Requirements:
     * - `supplierId` must be greater than 0.
     * - `amountToPay` must be greater than 0.
     *
     * @param supplierId The ID of the supplier.
     * @param amountToPay The amount to pay for electricity.
     */
    function payForElectricity(uint256 supplierId, uint256 amountToPay) external gtZero(amountToPay) {
        require(
            manager.MCGR().transferFrom(msg.sender, address(manager.escrow()), amountToPay + manager.fees()),
            "Main: transfer to Escrow failed"
        );
        manager.escrow().sendFundsToSupplier(msg.sender, supplierId, amountToPay);
    }

    /**
     * @notice Gets the rewards for a supplier.
     * Requirements:
     * - `supplierId` must be greater than 0.
     *
     * @param supplierId The ID of the supplier.
     */
    function getRewards(uint256 supplierId) external {
        manager.staking().sendRewards(msg.sender, supplierId);
    }
}
