// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

import "../manager/interfaces/IManager.sol";

struct EnergyConsumption {
    uint256 timestamp;
    uint256 consumption;
}

/**
 * @title Oracle contract to record indicators of consumed energy from the source
 * @dev This contract allows recording and retrieving energy consumption data for users and tokens.
 * The contract is managed by an Oracle Provider who can record energy consumption and an Energy Oracle Manager
 * who can retrieve the consumption data.
 * @author Bohdan
 */
contract EnergyOracle is AccessControl, Pausable {
    ///@dev Emmited when an Oracle provider
    event EnergyConsumptionRecorded(
        address indexed sender,
        address indexed user,
        uint256 indexed tokenId,
        uint256 timestamp,
        uint256 consumption
    );
    ///@dev Emmited when called getEnergyConsumption()
    event EnergyConsumptionSent(
        address indexed sender,
        address indexed user,
        uint256 indexed tokenId,
        uint256 timestamp,
        uint256 consumption
    );
    ///@dev Emmited when an Outlier values provided
    event OutlierDetected(
        address indexed sender,
        address indexed user,
        uint256 indexed tokenId,
        uint256 timestamp,
        uint256 consumption
    );

    /// @dev Keccak256 hashed `ENERGY_ORACLE_MANAGER_ROLE` string
    bytes32 public constant ENERGY_ORACLE_MANAGER_ROLE = keccak256(bytes("ENERGY_ORACLE_MANAGER_ROLE"));
    /// @dev Keccak256 hashed `ORACLE_PROVIDER_ROLE` string
    bytes32 public constant ORACLE_PROVIDER_ROLE = keccak256(bytes("ORACLE_PROVIDER_ROLE"));
    /// @dev Keccak256 hashed `ESCROW` string
    bytes32 public constant ESCROW = keccak256(bytes("ESCROW"));

    /// @dev Manager contract
    IManager public manager;

    /// @dev Mapping to store consumption
    mapping(address => mapping(uint256 => EnergyConsumption[])) private energyConsumptions; // user => tokenId => timestamp => EnergyConsumptions

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address account) {
        require(account != address(0), "EnergyOracle: account is address 0");
        _;
    }

    /// @dev Throws if passed address 0 as parameter
    modifier isCorrectUser(address account, uint tokenId) {
        require(manager.ELU().ownerOf(tokenId) == account, "EnergyOracle: user is not correct");
        _;
    }

    /// @notice Constructor to initialize StakingManagement contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE`, `ENERGY_ORACLE_MANAGER_ROLE` and `ORACLE_PROVIDER_ROLE` roles to `msg.sender`
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ENERGY_ORACLE_MANAGER_ROLE, msg.sender);
        _grantRole(ORACLE_PROVIDER_ROLE, msg.sender);
        _grantRole(ESCROW, msg.sender);

        manager = _manager;
    }

    /**
     * @notice Records the energy consumption for a user and token at a specific timestamp.
     * @dev
     * Requirements:
     * - `msg.sender` must have ORACLE_PROVIDER_ROLE
     * - `user` must have token with `tokenId`
     * - `timestamp` must be arrived
     *
     * @param user The user address
     * @param tokenId The token ID
     * @param timestamp The timestamp for the energy consumption
     * @param consumption The energy consumption value
     */
    function recordEnergyConsumption(
        address user,
        uint tokenId,
        uint256 timestamp,
        uint256 consumption
    ) external onlyRole(ORACLE_PROVIDER_ROLE) zeroAddressCheck(user) isCorrectUser(user, tokenId) {
        require(timestamp <= block.timestamp, "EnergyOracle: timestamp has not yet arrived");

        EnergyConsumption[] storage userTokenConsumptions = energyConsumptions[user][tokenId];
        uint length = userTokenConsumptions.length;

        // Reconciliation and validation
        bool isValueMatch = false;
        bool isOutlier = false;

        for (uint i = 0; i < length; i++) {
            if (_isApproximatelyEqual(userTokenConsumptions[i].timestamp, timestamp)) {
                // Check if the consumption value is within an acceptable range
                if (_isWithinAcceptableRange(consumption, userTokenConsumptions[i].consumption)) {
                    isValueMatch = true;
                } else {
                    isOutlier = true;
                }
                break;
            }
        }

        require(isValueMatch, "EnergyOracle: value mismatch");

        // If the value is not an outlier, record the energy consumption
        if (!isOutlier) {
            emit EnergyConsumptionRecorded(msg.sender, user, tokenId, timestamp, consumption);

            manager.MCGR().mint(msg.sender, manager.rewardAmount() * 2);

            energyConsumptions[user][tokenId].push(EnergyConsumption(timestamp, consumption));
        }

        // If the value is an outlier, emit an event or take appropriate action
        if (isOutlier) {
            emit OutlierDetected(msg.sender, user, tokenId, timestamp, consumption);
        }
    }

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
    )
        public
        onlyRole(ESCROW)
        whenNotPaused
        zeroAddressCheck(user)
        isCorrectUser(user, tokenId)
        returns (uint256 consumption)
    {
        EnergyConsumption[] memory userTokenConsumptions = energyConsumptions[user][tokenId];
        uint length = userTokenConsumptions.length;

        if (length == 0 || userTokenConsumptions[0].timestamp > timestamp) {
            return 0;
        }

        // Round the timestamp to the nearest day boundary
        uint256 roundedTimestamp = (timestamp / 1 days) * 1 days;

        // Find the closest timestamp to the rounded timestamp
        uint left = 0;
        uint right = length - 1;
        uint closestIndex = 0;
        uint256 closestDifference = type(uint256).max;

        while (left <= right) {
            uint mid = (left + right) / 2;
            uint256 currentTimestamp = userTokenConsumptions[mid].timestamp;
            uint256 difference = roundedTimestamp > currentTimestamp
                ? roundedTimestamp - currentTimestamp
                : currentTimestamp - roundedTimestamp;

            if (difference < closestDifference) {
                closestIndex = mid;
                closestDifference = difference;
            }

            if (currentTimestamp < roundedTimestamp) {
                left = mid + 1;
            } else if (currentTimestamp > roundedTimestamp) {
                right = mid - 1;
            } else {
                // Exact match found, use it as the closest index
                closestIndex = mid;
                break;
            }
        }

        // Get the consumption value at the closest index
        consumption = userTokenConsumptions[closestIndex].consumption;

        // Delete the energy consumption array after reading the value
        delete energyConsumptions[user][tokenId];

        emit EnergyConsumptionSent(msg.sender, user, tokenId, timestamp, consumption);

        return consumption;
    }

    /**
     * @notice Pauses the contract
     * @dev Requirements:
     * - `msg.sender` must have ENERGY_ORACLE_MANAGER_ROLE
     */
    function pause() external onlyRole(ENERGY_ORACLE_MANAGER_ROLE) {
        _pause();
    }

    /**
     * @notice Unpauses the contract
     * @dev Requirements:
     * - `msg.sender` must have ENERGY_ORACLE_MANAGER_ROLE
     */
    function unpause() external onlyRole(ENERGY_ORACLE_MANAGER_ROLE) {
        _unpause();
    }

    function _isWithinAcceptableRange(uint256 newValue, uint256 existingValue) internal view returns (bool) {
        // Define your acceptable range logic here
        uint256 acceptableRange = _calculateAcceptableRange(existingValue);

        // Check if the absolute difference between the new and existing values is within the acceptable range
        uint256 difference = newValue > existingValue ? newValue - existingValue : existingValue - newValue;
        return difference <= acceptableRange;
    }

    function _calculateAcceptableRange(uint256 value) internal view returns (uint256) {
        // Define your acceptable range calculation logic here
        // You can use a percentage or a fixed value depending on your requirements
        // For example, return value * 10 / 100; to allow a 10% difference from the existing value
        return (value * manager.percentage()) / 100;
    }

    function _isApproximatelyEqual(uint256 a, uint256 b) internal view returns (bool) {
        return (a >= b - manager.tolerance()) && (a <= b + manager.tolerance());
    }
}
