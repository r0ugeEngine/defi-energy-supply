// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../tokens/ERC20/interfaces/IMCGR.sol";
import "../tokens/ERC721/interfaces/INRGS.sol";

/**
 * @title StakingManagement contract for staking contract management
 * @author Bohdan
 */
abstract contract StakingManagement is AccessControl {
    /// @dev Emitted when a manager has changed the `MCGR` link to another contract
    event MCGRchanged(address indexed sender, IMCGR indexed newMCGR);
    /// @dev Emitted when a manager has changed the `NRGS` link to another contract
    event NRGSchanged(address indexed sender, INRGS indexed newNRGS);
    /// @dev Emitted when a manager has changed the `rewardAmount`
    event RewardAmountChanged(address indexed sender, uint256 indexed newRewardAmount);

    /// @dev Keccak256 hashed `STAKING_MANAGER_ROLE` string
    bytes32 public constant STAKING_MANAGER_ROLE = keccak256(bytes("STAKING_MANAGER_ROLE"));

    // Tokens
    ///@dev Reward token
    IMCGR public MCGR;
    ///@dev Energy Supply token
    INRGS public NRGS;

    // Rewards
    /// @dev Amount of rewards to suppliers
    uint256 public rewardAmount;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "StakingReward: supplier is address 0");
        _;
    }

    /// @notice Constructor to initialize StakingManagement contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `STAKING_MANAGER_ROLE` roles to `msg.sender`
    /// @dev Sets `MCGR` and `NRGS` tokens links and `rewardAmount` value
    constructor(IMCGR _MCGR, INRGS _NRGS, uint256 _rewardAmount) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(STAKING_MANAGER_ROLE, msg.sender);

        MCGR = _MCGR;
        NRGS = _NRGS;

        rewardAmount = _rewardAmount;
    }

    /**
     * @notice Changes MCGR link to another contract.
     * Requirements:
     * - `msg.sender` must have `STAKING_MANAGER_ROLE`
     *
     * @param _MCGR IMCGR
     * @return bool
     */
    function changeMCGR(
        IMCGR _MCGR
    ) external onlyRole(STAKING_MANAGER_ROLE) zeroAddressCheck(address(_MCGR)) returns (bool) {
        emit MCGRchanged(msg.sender, _MCGR);

        MCGR = _MCGR;
        return true;
    }

    /**
     * @notice Changes NRGS link to another contract.
     * Requirements:
     * - `msg.sender` must have `STAKING_MANAGER_ROLE`
     *
     * @param _NRGS INRGS
     * @return bool
     */
    function changeNRGS(
        INRGS _NRGS
    ) external onlyRole(STAKING_MANAGER_ROLE) zeroAddressCheck(address(_NRGS)) returns (bool) {
        emit NRGSchanged(msg.sender, _NRGS);

        NRGS = _NRGS;
        return true;
    }

    /**
     * @notice Changes reward amount to another amount.
     * Requirements:
     * - `msg.sender` must have `STAKING_MANAGER_ROLE`
     *
     * @param _newRewardAmount uint256
     * @return bool
     */
    function changeRewardAmount(uint256 _newRewardAmount) external onlyRole(STAKING_MANAGER_ROLE) returns (bool) {
        emit RewardAmountChanged(msg.sender, _newRewardAmount);

        rewardAmount = _newRewardAmount;
        return true;
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
