// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "../staking/interfaces/IStakingReward.sol";
import "../tokens/ERC721/interfaces/INRGS.sol";
import "../tokens/ERC721/interfaces/IELU.sol";

/**
 * @title RegisterManagement contract for register contract management
 * @author Bohdan
 */
abstract contract RegisterManagement is AccessControl {
    /// @dev Emitted when a manager has changed the `ELU` link to another contract
    event ELUchanged(address indexed sender, IELU indexed newELU);
    /// @dev Emitted when a manager has changed the `NRGS` link to another contract
    event NRGSchanged(address indexed sender, INRGS indexed newNRGS);
    /// @dev Emitted when a manager has changed the `staking` link to another contract
    event StakingChanged(address indexed sender, IStakingReward indexed staking);

    /// @dev Keccak256 hashed `REGISTER_MANAGER_ROLE` string
    bytes32 public constant REGISTER_MANAGER_ROLE = keccak256(bytes("REGISTER_MANAGER_ROLE"));

    // Tokens
    ///@dev Reward token
    IELU public ELU;
    ///@dev Energy Supply token
    INRGS public NRGS;

    // Staking
    ///@dev Staking contract
    IStakingReward public staking;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "Register: supplier is address 0");
        _;
    }

    /// @notice Constructor to initialize StakingManagement contract
    /// @dev Grants `DEFAULT_ADMIN_ROLE` and `REGISTER_MANAGER_ROLE` roles to `msg.sender`
    /// @dev Sets `ELU`, `NRGS` tokens and `staking` contract links
    constructor(IELU _ELU, INRGS _NRGS, IStakingReward _staking) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REGISTER_MANAGER_ROLE, msg.sender);

        ELU = _ELU;
        NRGS = _NRGS;
        staking = _staking;
    }

    /**
     * @notice Changes ELU link to another contract.
     * Requirements:
     * - `msg.sender` must have `REGISTER_MANAGER_ROLE`
     *
     * @param _ELU IELU
     * @return bool
     */
    function changeELU(
        IELU _ELU
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(address(_ELU)) returns (bool) {
        emit ELUchanged(msg.sender, _ELU);

        ELU = _ELU;
        return true;
    }

    /**
     * @notice Changes NRGS link to another contract.
     * Requirements:
     * - `msg.sender` must have `REGISTER_MANAGER_ROLE`
     *
     * @param _NRGS INRGS
     * @return bool
     */
    function changeNRGS(
        INRGS _NRGS
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(address(_NRGS)) returns (bool) {
        emit NRGSchanged(msg.sender, _NRGS);

        NRGS = _NRGS;
        return true;
    }

    /**
     * @notice Changes `staking` link to another contract.
     * Requirements:
     * - `msg.sender` must have `REGISTER_MANAGER_ROLE`
     *
     * @param _staking IStakingReward
     * @return bool
     */
    function changeStakingContract(
        IStakingReward _staking
    ) external onlyRole(REGISTER_MANAGER_ROLE) zeroAddressCheck(address(_staking)) returns (bool) {
        emit StakingChanged(msg.sender, _staking);

        staking = _staking;
        return true;
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
