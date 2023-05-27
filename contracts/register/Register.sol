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

    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "Register: supplier is address 0");
        _;
    }

    modifier isRegistered(
        address token,
        address supplier,
        uint tokenId
    ) {
        require(IERC721(token).ownerOf(tokenId) == supplier, "Register: supplier is not registered");
        _;
    }

    modifier isNotRegistered(
        address token,
        address supplier,
        uint tokenId
    ) {
        require(!(IERC721(token).ownerOf(tokenId) == supplier), "Register: supplier is already registered");
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
        isNotRegistered(address(NRGS), supplier, tokenId)
        returns (bool)
    {
        NRGS.mint(supplier, tokenId);
        staking.enterStaking(supplier, tokenId);

        emit SupplierRegistered(msg.sender, supplier, block.timestamp);
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
        uint256 tokenId,
        address supplier
    )
        external
        onlyRole(REGISTER_MANAGER_ROLE)
        zeroAddressCheck(user)
        isNotRegistered(address(ELU), user, tokenId)
        returns (bool)
    {
        ELU.mint(user, tokenId, supplier);

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
        isRegistered(address(NRGS), supplier, tokenId)
        returns (bool)
    {
        NRGS.burn(tokenId);
        staking.exitStaking(supplier, tokenId);

        emit SupplierUnregistered(msg.sender, supplier, block.timestamp);
        return true;
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
     * @return bool
     */
    function unRegisterElectricityUser(
        address user,
        uint256 tokenId
    )
        external
        onlyRole(REGISTER_MANAGER_ROLE)
        zeroAddressCheck(user)
        isRegistered(address(ELU), user, tokenId)
        returns (bool)
    {
        ELU.burn(tokenId);

        emit UserUnregistered(msg.sender, user, block.timestamp);
        return true;
    }
}
