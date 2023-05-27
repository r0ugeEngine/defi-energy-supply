// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RegisterManagement.sol";

/**
 * @title Contract for registration of suppliers and users
 * @author Bohdan
 */
contract Register is RegisterManagement {
    ///@dev Emmited when a user registers as an Energy supplier
    event SupplierRegistered(address indexed sender, address indexed supplier, uint256 timestamp);
    ///@dev Emmited when a user unregisters as an Energy supplier
    event SupplierUnregistered(address indexed sender, address indexed supplier, uint256 timestamp);

    ///@dev Emmited when a user registers as an Electricity user
    event UserRegistered(address indexed sender, address indexed user, uint256 timestamp);
    ///@dev Emmited when a user unregisters as an Electricity user
    event UserUnregistered(address indexed sender, address indexed user, uint256 timestamp);

    mapping(address => mapping(uint => bool)) public registeredSuppliers;
    mapping(address => mapping(uint => bool)) public registeredUsers;

    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "Register: supplier is address 0");
        _;
    }

    modifier isCorrectOwner(
        address token,
        address supplier,
        uint tokenId
    ) {
        require(IERC721(token).ownerOf(tokenId) == supplier, "Register: supplier is not the owner of this token");
        _;
    }

    /// @notice Constructor to initialize StakingManagement contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `REGISTER_MANAGER_ROLE` roles to `msg.sender`
    /// @dev Sets `ELU`, `NRGS` tokens and `staking` contract links
    constructor(IELU _ELU, INRGS _NRGS, IStakingReward _staking) RegisterManagement(_ELU, _NRGS, _staking) {}

    /**
     * @notice Registers Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `supplier` must not be address 0
     * - `supplier` must have NRGS token
     *
     * @param supplier address
     * @param tokenId uint256
     * @return bool
     */
    function registerSupplier(
        address supplier,
        uint256 tokenId
    )
        external
        onlyRole(REGISTER_MANAGER_ROLE)
        zeroAddressCheck(supplier)
        isCorrectOwner(address(NRGS), supplier, tokenId)
        returns (bool)
    {
        require(isRegisteredSupplier(supplier, tokenId), "Register: supplier is already registered");
        emit SupplierRegistered(msg.sender, supplier, block.timestamp);

        registeredSuppliers[supplier];

        return true;
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
     * @return bool
     */
    function registerElectricityUser(
        address user,
        uint256 tokenId
    )
        external
        onlyRole(REGISTER_MANAGER_ROLE)
        zeroAddressCheck(user)
        isCorrectOwner(address(ELU), user, tokenId)
        returns (bool)
    {
        require(isRegisteredUser(user, tokenId), "Register: user is already registered");
        emit UserRegistered(msg.sender, user, block.timestamp);

        return true;
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
     * @return bool
     */
    function unRegisterSupplier(
        address supplier,
        uint256 tokenId
    )
        external
        onlyRole(REGISTER_MANAGER_ROLE)
        zeroAddressCheck(supplier)
        isCorrectOwner(address(NRGS), supplier, tokenId)
        returns (bool)
    {
        require(!isRegisteredSupplier(supplier, tokenId), "Register: supplier is not registered");
        emit SupplierUnregistered(msg.sender, supplier, block.timestamp);

        return true;
    }

    /**
     * @notice Unregisters Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `user` must not be address 0
     * - `user` must have NRGS token
     *
     * @param user address
     * @param tokenId uint256
     * @return bool
     */
    function unRegisterElectricityUser(
        address user,
        uint256 tokenId
    )
        external
        onlyRole(REGISTER_MANAGER_ROLE)
        zeroAddressCheck(user)
        isCorrectOwner(address(ELU), user, tokenId)
        returns (bool)
    {
        require(!isRegisteredUser(user, tokenId), "Register: user is already registered");
        emit UserUnregistered(msg.sender, user, block.timestamp);

        return true;
    }

    function isRegisteredSupplier(address user, uint256 tokenId) public view returns (bool) {
        return staking.suppliers(user, tokenId).updatedAt > 0 && registeredSuppliers[user][tokenId];
    }

    function isRegisteredUser(address user, uint tokenId) public view returns (bool) {
        return registeredUsers[user][tokenId];
    }
}
