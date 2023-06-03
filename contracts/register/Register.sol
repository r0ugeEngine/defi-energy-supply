// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../manager/interfaces/IManager.sol";

/**
 * @title Contract for registration of suppliers and users
 * @author Bohdan
 */
contract Register is AccessControl {
    ///@dev Emmited when a user registers as an Energy supplier
    event SupplierRegistered(address indexed sender, address indexed supplier, uint256 timestamp);
    ///@dev Emmited when a user unregisters as an Energy supplier
    event SupplierUnregistered(address indexed sender, address indexed supplier, uint256 timestamp);

    ///@dev Emmited when a user registers as an Electricity user
    event UserRegistered(address indexed sender, address indexed user, uint256 timestamp);
    ///@dev Emmited when a user unregisters as an Electricity user
    event UserUnregistered(address indexed sender, address indexed user, uint256 timestamp);

    /// @dev Keccak256 hashed `REGISTER_MANAGER_ROLE` string
    bytes32 public constant REGISTER_MANAGER_ROLE = keccak256(bytes("REGISTER_MANAGER_ROLE"));

    /// @dev Manager contract
    IManager public manager;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "Register: supplier is address 0");
        _;
    }

    /// @notice Constructor to initialize StakingManagement contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `REGISTER_MANAGER_ROLE` roles to `msg.sender`
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTER_MANAGER_ROLE, msg.sender);

        manager = _manager;
    }

    /**
     * @notice Registers Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `supplier` must not be address 0
     * - `supplier` must have NRGS token
     *
     * @param supplier address
     * @param tokenId uint256
     */
    function registerSupplier(
        address supplier,
        uint256 tokenId
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(supplier) {
        manager.NRGS().mint(supplier, tokenId);
        manager.staking().enterStaking(supplier, tokenId);

        emit SupplierRegistered(msg.sender, supplier, block.timestamp);
    }

    /**
     * @notice Registers Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `user` must not be address 0
     * - `user` must have NRGS token
     *
     * @param user address
     * @param tokenId uint256
     */
    function registerElectricityUser(
        address user,
        uint256 tokenId,
        address supplier
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(user) zeroAddressCheck(supplier) {
        manager.ELU().mint(user, tokenId, supplier);

        emit UserRegistered(msg.sender, user, block.timestamp);
    }

    /**
     * @notice Unregisters Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `supplier` must not be address 0
     * - `supplier` must have NRGS token
     *
     * @param supplier address
     * @param tokenId uint256
     */
    function unRegisterSupplier(
        address supplier,
        uint256 tokenId
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(supplier) {
        manager.NRGS().burn(tokenId);
        manager.staking().exitStaking(supplier, tokenId);

        emit SupplierUnregistered(msg.sender, supplier, block.timestamp);
    }

    /**
     * @notice Unregisters Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `user` must not be address 0
     * - `user` must have ELU token
     *
     * @param user address
     * @param tokenId uint256
     */
    function unRegisterElectricityUser(
        address user,
        uint256 tokenId
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(user) {
        manager.ELU().burn(tokenId);

        emit UserUnregistered(msg.sender, user, block.timestamp);
    }
}
