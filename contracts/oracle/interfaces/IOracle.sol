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
    /// @notice Gets the energy consumption for a user, token, and timestamp
    /// Requirements: `msg.sender` must have ORACLE_PROVIDER_ROLE
    /// @param user The user address
    /// @param tokenId The token ID
    /// @param timestamp The timestamp
    /// @return consumption The energy consumption value
    function getEnergyConsumption(
        address user,
        uint256 tokenId,
        uint256 timestamp
    ) external returns (uint256 consumption);
}
