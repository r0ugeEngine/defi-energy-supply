// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./StakingManagement.sol";
import "../FixedPointMath.sol";

import "../tokens/ERC20/interfaces/IMCGR.sol";
import "../tokens/ERC721/interfaces/INFTTemplate.sol";

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

    /// @notice Constructor to initialize StakingReward contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `STAKING_MANAGER_ROLE` roles to `msg.sender`
    /// @dev Sets `MCGR` and `NRGS` tokens links and `rewardAmount` value
    constructor(
        IMCGR _MCGR,
        INFTTemplate _NRGS,
        uint256 _rewardAmount
    ) StakingManagement(_MCGR, _NRGS, _rewardAmount) {}

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
    function enterStaking(address supplier, uint256 tokenId) external onlyRole(STAKING_MANAGER_ROLE) returns (bool) {
        require(supplier != address(0), "StakingReward: supplier is address 0");
        require(NRGS.balanceOf(supplier) > 0, "StakingReward: supplier is not registered");
        require(NRGS.ownerOf(tokenId) == supplier, "StakingReward: supplier is not the owner of this token");

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
    function sendRewards(address supplier, uint256 tokenId) external onlyRole(STAKING_MANAGER_ROLE) returns (bool) {
        require(NRGS.ownerOf(tokenId) == supplier, "StakingReward: supplier is not the owner of this token");
        require(_sendRewards(supplier, tokenId), "StakingReward: rewards sending failed");
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
    function exitStaking(address supplier, uint256 tokenId) external onlyRole(STAKING_MANAGER_ROLE) returns (bool) {
        require(NRGS.ownerOf(tokenId) == supplier, "StakingReward: supplier is not the owner of this token");
        require(_sendRewards(supplier, tokenId), "StakingReward: rewards sending failed");

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
     * @return bool
     * @return Supplier memory
     */
    function updateRewards(address supplier, uint tokenId) public returns (bool, Supplier memory) {
        Supplier storage _supplier = suppliers[supplier][tokenId];

        require(_supplier.updatedAt > 0, "StakingReward: supplier is not entered with this token");
        require(_supplier.updatedAt <= block.timestamp, "StakingReward: updatedAt error");

        _supplier.pendingReward = _updateRewardRate(_supplier.updatedAt);
        _supplier.updatedAt = block.timestamp;

        return (true, _supplier);
    }

    function _sendRewards(address supplier, uint tokenId) private returns (bool) {
        require(supplier != address(0), "StakingReward: supplier is address 0");

        (bool success, Supplier memory _supplier) = updateRewards(supplier, tokenId);
        require(success, "StakingReward: rewards update error");

        suppliers[supplier][tokenId].pendingReward = 0;
        suppliers[supplier][tokenId].updatedAt = block.timestamp;

        MCGR.mint(supplier, _supplier.pendingReward);

        return true;
    }

    function _updateRewardRate(uint _updatedAt) private view returns (uint256 rewardToUser) {
        uint timePassed = block.timestamp - _updatedAt;

        if (totalSuppliers > 0) {
            rewardToUser = rewardAmount.mulDiv(timePassed, totalSuppliers);
        } else {
            rewardToUser = 0;
        }
    }
}
