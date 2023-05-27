// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StakingManagement.sol";
import "../math/FixedPointMath.sol";

import "../tokens/ERC20/interfaces/IMCGR.sol";
import "../tokens/ERC721/interfaces/INRGS.sol";

/**
 * @title StakingReward contract for rewards management
 * @author Bohdan
 */
contract StakingReward is StakingManagement {
    using FixedPointMath for uint256;

    ///@dev Emmited when a user registers as an Energy supplier
    event EnterStaking(address indexed sender, address indexed supplier, uint256 timestamp);
    ///@dev Emmited when a user unregisters as an Energy supplier
    event ExitStaking(address indexed sender, address indexed supplier, uint256 timestamp);

    /// @dev Emitted when a supplier withdraws some amount of rewards from `StakingReward`
    event RewardSent(address indexed sender, address indexed to, uint256 amount);

    struct Supplier {
        uint256 updatedAt;
        uint256 pendingReward;
    }

    /// @dev Total suppliers
    uint256 public totalSuppliers;

    /// @dev Address to supplier
    mapping(address => mapping(uint => Supplier)) public suppliers;

    /// @dev Throws if passed not correct owner of tokenId
    modifier isCorrectOwner(address supplier, uint tokenId) {
        require(NRGS.ownerOf(tokenId) == supplier, "StakingReward: supplier is not the owner of this token");
        _;
    }

    /// @notice Constructor to initialize StakingReward contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `STAKING_MANAGER_ROLE` roles to `msg.sender`
    /// @dev Sets `MCGR` and `NRGS` tokens links and `rewardAmount` value
    constructor(IMCGR _MCGR, INRGS _NRGS, uint256 _rewardAmount) StakingManagement(_MCGR, _NRGS, _rewardAmount) {}

    /**
     * @notice Enters staking process.
     * Requirements:
     * - `msg.sender` must have STAKING_MANAGER_ROLE
     * - `supplier` must not be address 0
     * - `supplier` must have NRGS token
     *
     * @param supplier address
     * @param tokenId uint256
     * @return bool
     */
    function enterStaking(
        address supplier,
        uint256 tokenId
    )
        external
        onlyRole(STAKING_MANAGER_ROLE)
        zeroAddressCheck(supplier)
        isCorrectOwner(supplier, tokenId)
        returns (bool)
    {
        totalSuppliers++;
        suppliers[supplier][tokenId] = Supplier({
            updatedAt: block.timestamp,
            pendingReward: _updateRewardRate(block.timestamp)
        });

        emit EnterStaking(msg.sender, supplier, block.timestamp);

        return true;
    }

    /**
     * @notice Sends rewards to suppliers.
     * Requirements:
     * - `msg.sender` must have STAKING_MANAGER_ROLE
     * - `supplier` must be in staking
     *
     * @param supplier address
     * @param tokenId uint256
     * @return bool
     */
    function sendRewards(
        address supplier,
        uint256 tokenId
    )
        external
        onlyRole(STAKING_MANAGER_ROLE)
        zeroAddressCheck(supplier)
        isCorrectOwner(supplier, tokenId)
        returns (bool)
    {
        _sendRewards(supplier, tokenId);
        emit RewardSent(msg.sender, supplier, block.timestamp);
        return true;
    }

    /**
     * @notice Exits staking.
     * Requirements:
     * - `msg.sender` must have STAKING_MANAGER_ROLE
     * - `supplier` must be in staking
     *
     * @param supplier address
     * @param tokenId uint256
     * @return bool
     */
    function exitStaking(
        address supplier,
        uint256 tokenId
    ) external onlyRole(STAKING_MANAGER_ROLE) zeroAddressCheck(supplier) returns (bool) {
        _sendRewards(supplier, tokenId);

        totalSuppliers--;
        delete suppliers[supplier][tokenId];

        emit ExitStaking(msg.sender, supplier, block.timestamp);
        return true;
    }

    /**
     * @notice Updates rewards for `supplier`.
     * Requirements:
     * - `supplier` must be in staking
     *
     * @param supplier address
     * @param tokenId uint256
     * @return Supplier memory
     */
    function updateRewards(
        address supplier,
        uint tokenId
    ) public zeroAddressCheck(supplier) isCorrectOwner(supplier, tokenId) returns (Supplier memory) {
        return _updateRewards(supplier, tokenId);
    }

    function _updateRewards(address supplier, uint tokenId) private returns (Supplier memory) {
        Supplier storage _supplier = suppliers[supplier][tokenId];

        require(_supplier.updatedAt > 0, "StakingReward: supplier is not entered with this token");
        assert(_supplier.updatedAt <= block.timestamp);

        _supplier.pendingReward = _updateRewardRate(_supplier.updatedAt);
        _supplier.updatedAt = block.timestamp;

        return _supplier;
    }

    function _sendRewards(address supplier, uint tokenId) private {
        Supplier memory _supplier = _updateRewards(supplier, tokenId);

        suppliers[supplier][tokenId].pendingReward = 0;
        suppliers[supplier][tokenId].updatedAt = block.timestamp;

        MCGR.mint(supplier, _supplier.pendingReward);
    }

    function _updateRewardRate(uint _updatedAt) private view returns (uint256 rewardToUser) {
        uint timePassed = block.timestamp - _updatedAt;

        rewardToUser = rewardAmount.mulDiv(timePassed, totalSuppliers);
    }
}
