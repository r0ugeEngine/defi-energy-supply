// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Interface for oracle contract to record indicators of consumed energy from the source
 * @dev This contract allows recording and retrieving energy consumption data for users and tokens.
 * The contract is managed by an Oracle Provider who can record energy consumption and an Energy Oracle Manager
 * who can retrieve the consumption data.
 * @author Bohdan
 */
interface IEnergyOracle {
    /// @notice Gets the energy consumption for a user, token
    /// Requirements: `msg.sender` must have ORACLE_PROVIDER_ROLE
    /// @param user The user address
    /// @param supplierId The token ID
    /// @return consumption The energy consumption value
    function getEnergyConsumption(address user, uint256 supplierId) external returns (uint256 consumption);

    /**
     * @notice Records the energy consumption for a user and token at a specific timestamp.
     * @dev
     * Requirements:
     * - `msg.sender` must have ORACLE_PROVIDER_ROLE
     * - `user` must have token with `supplierId`
     * - `timestamp` must be equal to 21:00
     *
     * @param user The user address
     * @param supplierId The token ID
     * @param timestamp The timestamp for the energy consumption
     * @param consumption The energy consumption value
     */
    function recordEnergyConsumption(address user, uint supplierId, uint256 timestamp, uint256 consumption) external;
}
