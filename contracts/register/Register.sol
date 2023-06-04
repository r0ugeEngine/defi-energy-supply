// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

import "../manager/interfaces/IManager.sol";

/**
 * @title Contract for registration of suppliers and users
 * @author Bohdan
 */
contract Register is AccessControl, ERC1155Holder {
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
    modifier zeroAddressCheck(address account) {
        require(account != address(0), "Register: account is address 0");
        _;
    }

    /// @notice Constructor to initialize Register contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `REGISTER_MANAGER_ROLE` roles to `msg.sender`
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTER_MANAGER_ROLE, msg.sender);

        manager = _manager;
    }

    /**
     * @notice Registers an Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE.
     * - `supplier` must not be address 0.
     * - `supplier` must have NRGS token.
     *
     * @param supplier The address of the supplier.
     * @param supplierId The ID of the supplier.
     * @param amountOfUsers The amount of users for the supplier.
     */
    function registerSupplier(
        address supplier,
        uint256 supplierId,
        uint256 amountOfUsers
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(supplier) {
        manager.NRGS().mint(supplier, supplierId);

        manager.ELU().mint(address(this), supplierId, amountOfUsers);

        manager.staking().enterStaking(supplier, supplierId);

        emit SupplierRegistered(msg.sender, supplier, block.timestamp);
    }

    /**
     * @notice Registers an Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE.
     * - `user` must not be address 0.
     * - `supplier` must not be address 0.
     *
     * @param user The address of the user.
     * @param supplierId The ID of the supplier.
     * @param supplier The address of the supplier.
     */
    function registerElectricityUser(
        address user,
        uint256 supplierId,
        address supplier
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(user) zeroAddressCheck(supplier) {
        manager.ELU().safeTransferFrom(address(this), user, supplierId, 1, "");

        emit UserRegistered(msg.sender, user, block.timestamp);
    }

    /**
     * @notice Unregisters an Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE.
     * - `supplier` must not be address 0.
     * - `supplier` must have NRGS token.
     *
     * @param supplier The address of the supplier.
     * @param supplierId The ID of the supplier.
     */
    function unRegisterSupplier(
        address supplier,
        uint256 supplierId
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(supplier) {
        require(manager.NRGS().ownerOf(supplierId) == supplier, "Register: supplier is not correct");

        manager.NRGS().burn(supplierId);

        manager.staking().exitStaking(supplier, supplierId);

        emit SupplierUnregistered(msg.sender, supplier, block.timestamp);
    }

    /**
     * @notice Unregisters an Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE.
     * - `user` must not be address 0.
     * - `user` must have ELU token.
     *
     * @param user The address of the user.
     * @param supplierId The ID of the supplier.
     */
    function unRegisterElectricityUser(
        address user,
        uint256 supplierId
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(user) {
        require(manager.ELU().balanceOf(user, supplierId) > 0, "Register: supplier is not correct");

        manager.ELU().burn(user, supplierId, 1);

        emit UserUnregistered(msg.sender, user, block.timestamp);
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155Receiver, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
