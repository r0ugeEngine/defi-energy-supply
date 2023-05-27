// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Interface for StakingReward contract
 * @author Bohdan
 */
interface IStakingReward {
    struct Supplier {
        uint256 updatedAt;
        uint256 pendingReward;
    }

    /// @dev Address to supplier
    function suppliers(address supplier, uint tokenId) external view returns (Supplier memory);

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
    function enterStaking(address supplier, uint256 tokenId) external returns (bool);

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
    function sendRewards(address supplier, uint256 tokenId) external returns (bool);

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
    function exitStaking(address supplier, uint256 tokenId) external returns (bool);

    /**
     * @notice Updates rewards for `supplier`.
     * Requirements:
     * - `supplier` must be in staking
     *
     * @param supplier address
     * @param tokenId uint256
     * @return Supplier memory
     */
    function updateRewards(address supplier, uint tokenId) external returns (Supplier memory);
}
