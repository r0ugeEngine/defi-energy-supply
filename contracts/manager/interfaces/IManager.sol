// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../staking/interfaces/IStakingReward.sol";
import "../../tokens/ERC20/interfaces/IMCGR.sol";
import "../../tokens/ERC721/interfaces/INRGS.sol";
import "../../tokens/ERC721/interfaces/IELU.sol";

interface IManager {
    ///@dev Reward token
    function MCGR() external view returns (IMCGR);

    ///@dev Electricity user NFT token
    function ELU() external view returns (IELU);

    ///@dev Energy Supplier NFT token
    function NRGS() external view returns (INRGS);

    ///@dev Staking contract
    function staking() external view returns (IStakingReward);

    /// @dev Amount of rewards to suppliers
    function rewardAmount() external view returns (uint256);
}
