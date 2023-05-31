// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

import "./interfaces/IManager.sol";

/**
 * @title Manager contract for contracts management
 * @author Bohdan
 */
contract Manager is AccessControl, IManager {
    // ERC20
    /// @dev Emitted when a manager has changed the `MCGR` link to another contract
    event MCGRchanged(address indexed sender, IMCGR newMCGR);

    // NFTs
    /// @dev Emitted when a manager has changed the `ELU` link to another contract
    event ELUchanged(address indexed sender, IELU newELU);
    /// @dev Emitted when a manager has changed the `NRGS` link to another contract
    event NRGSchanged(address indexed sender, INRGS newNRGS);

    // Staking
    /// @dev Emitted when a manager has changed the `staking` link to another contract
    event StakingChanged(address indexed sender, IStakingReward staking);

    // Oracle
    /// @dev Emitted when a manager has changed the `oracle` link to another contract
    event OracleChanged(address indexed sender, IEnergyOracle oracle);

    // Register
    /// @dev Emitted when a manager has changed the `register` link to another contract
    event RegisterChanged(address indexed sender, IRegister register);

    // Amount
    /// @dev Emitted when a manager has changed the `rewardAmount`
    event RewardAmountChanged(address indexed sender, uint256 newRewardAmount);
    /// @dev Emitted when a manager has changed the `tolerance`
    event ToleranceChanged(address indexed sender, uint256 indexed newTolerance);

    /// @dev Keccak256 hashed `MANAGER_ROLE` string
    bytes32 public constant MANAGER_ROLE = keccak256(bytes("MANAGER_ROLE"));

    // Contracts
    ///@dev Reward token
    IMCGR public MCGR;
    ///@dev Electricity user NFT token
    IELU public ELU;
    ///@dev Energy Supplier NFT token
    INRGS public NRGS;

    ///@dev Staking contract
    IStakingReward public staking;
    ///@dev Oracle contract
    IEnergyOracle public oracle;
    ///@dev Register contract
    IRegister public register;

    // Values
    /// @dev Amount of rewards to suppliers
    uint256 public rewardAmount;
    /// @dev Tolerance for equality
    uint256 public tolerance;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "Manager: passed address is address 0");
        _;
    }

    /**
     * @notice Constructor to initialize StakingManagement contract
     * @dev Grants `DEFAULT_ADMIN_ROLE` and `MANAGER_ROLE` roles to `msg.sender`
     * Sets `MCGR` token address, `ELU` and `NRGS` tokens addresses, `staking` address
     * Sets `rewardAmount`, `percentage` and `tolerance`
     */
    constructor(IMCGR _MCGR, IELU _ELU, INRGS _NRGS, uint _rewardAmount, uint256 _tolerance) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);

        MCGR = _MCGR;

        ELU = _ELU;
        NRGS = _NRGS;

        rewardAmount = _rewardAmount;
        tolerance = _tolerance;
    }

    /**
     * @notice Changes MCGR link to another contract.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _MCGR IMCGR
     * @return bool
     */
    function changeMCGR(IMCGR _MCGR) external onlyRole(MANAGER_ROLE) zeroAddressCheck(address(_MCGR)) returns (bool) {
        emit MCGRchanged(msg.sender, _MCGR);

        MCGR = _MCGR;
        return true;
    }

    /**
     * @notice Changes NRGS link to another contract.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _NRGS INRGS
     * @return bool
     */
    function changeNRGS(INRGS _NRGS) external onlyRole(MANAGER_ROLE) zeroAddressCheck(address(_NRGS)) returns (bool) {
        emit NRGSchanged(msg.sender, _NRGS);

        NRGS = _NRGS;
        return true;
    }

    /**
     * @notice Changes ELU link to another contract.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _ELU IELU
     * @return bool
     */
    function changeELU(IELU _ELU) external onlyRole(MANAGER_ROLE) zeroAddressCheck(address(_ELU)) returns (bool) {
        emit ELUchanged(msg.sender, _ELU);

        ELU = _ELU;
        return true;
    }

    /**
     * @notice Changes `staking` link to another contract.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _staking IStakingReward
     * @return bool
     */
    function changeStakingContract(
        IStakingReward _staking
    ) external onlyRole(MANAGER_ROLE) zeroAddressCheck(address(_staking)) returns (bool) {
        emit StakingChanged(msg.sender, _staking);

        staking = _staking;
        return true;
    }

    /**
     * @notice Changes `oracle` link to another contract.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _oracle IEnergyOracle
     * @return bool
     */
    function changeOracle(
        IEnergyOracle _oracle
    ) external onlyRole(MANAGER_ROLE) zeroAddressCheck(address(_oracle)) returns (bool) {
        emit OracleChanged(msg.sender, _oracle);

        oracle = _oracle;
        return true;
    }

    /**
     * @notice Changes `register` link to another contract.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _register IRegister
     * @return bool
     */
    function changeRegister(
        IRegister _register
    ) external onlyRole(MANAGER_ROLE) zeroAddressCheck(address(_register)) returns (bool) {
        emit RegisterChanged(msg.sender, _register);

        register = _register;
        return true;
    }

    /**
     * @notice Changes reward amount to another amount.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _newRewardAmount uint256
     * @return bool
     */
    function changeRewardAmount(uint256 _newRewardAmount) external onlyRole(MANAGER_ROLE) returns (bool) {
        emit RewardAmountChanged(msg.sender, _newRewardAmount);

        rewardAmount = _newRewardAmount;
        return true;
    }

    /**
     * @notice Changes tolerance amount to another amount.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _newTolerance uint256
     * @return bool
     */
    function changeTolerance(uint256 _newTolerance) external onlyRole(MANAGER_ROLE) returns (bool) {
        emit ToleranceChanged(msg.sender, _newTolerance);

        tolerance = _newTolerance;
        return true;
    }

    /// @inheritdoc AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
