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

    // Address
    /// @dev Emitted when a manager has changed the `feeReceiver` link to another address
    event FeeReceiverChanged(address indexed sender, address newReceiver);

    // Amount
    /// @dev Emitted when a manager has changed the `rewardAmount`
    event RewardAmountChanged(address indexed sender, uint256 newRewardAmount);
    /// @dev Emitted when a manager has changed the `tolerance`
    event ToleranceChanged(address indexed sender, uint256 newTolerance);
    /// @dev Emitted when a manager has changed the `fees`
    event FeesChanged(address indexed sender, uint256 newFees);

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

    ///@dev Address where fees will be paid
    address public feeReceiver;

    // Values
    /// @dev Amount of rewards to suppliers
    uint256 public rewardAmount;
    /// @dev Tolerance for equality
    uint256 public tolerance;
    /// @dev Fees for payments to creators
    uint256 public fees;

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address supplier) {
        require(supplier != address(0), "Manager: passed address is address 0");
        _;
    }

    /// @dev Throws if passed value is <=0
    modifier gtZero(uint256 value) {
        require(value > 0, "Manager: passed value is <= 0");
        _;
    }

    /**
     * @notice Constructor to initialize StakingManagement contract
     * @dev Grants `DEFAULT_ADMIN_ROLE` and `MANAGER_ROLE` roles to `msg.sender`
     * Sets `MCGR` token address, `ELU` and `NRGS` tokens addresses, `staking` address
     * Sets `feeReceiver` address
     * Sets `rewardAmount`, `percentage` and `tolerance`
     */
    constructor(
        IMCGR _MCGR,
        IELU _ELU,
        INRGS _NRGS,
        address _feeReceiver,
        uint _rewardAmount,
        uint256 _tolerance,
        uint256 _fees
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);

        MCGR = _MCGR;
        ELU = _ELU;
        NRGS = _NRGS;

        feeReceiver = _feeReceiver;

        rewardAmount = _rewardAmount;
        tolerance = _tolerance;
        fees = _fees;
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
     * @notice Changes `feeReceiver` link to another address.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     *
     * @param _newFeeReceiver address
     * @return bool
     */
    function changeFeeReceiver(
        address _newFeeReceiver
    ) external onlyRole(MANAGER_ROLE) zeroAddressCheck(_newFeeReceiver) returns (bool) {
        emit FeeReceiverChanged(msg.sender, _newFeeReceiver);

        feeReceiver = _newFeeReceiver;
        return true;
    }

    /**
     * @notice Changes reward amount to another amount.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     * - `_newRewardAmount` must be > 0
     *
     * @param _newRewardAmount uint256
     * @return bool
     */
    function changeRewardAmount(
        uint256 _newRewardAmount
    ) external onlyRole(MANAGER_ROLE) gtZero(_newRewardAmount) returns (bool) {
        emit RewardAmountChanged(msg.sender, _newRewardAmount);

        rewardAmount = _newRewardAmount;
        return true;
    }

    /**
     * @notice Changes tolerance amount to another amount.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     * - `_newTolerance` must be > 0
     *
     * @param _newTolerance uint256
     * @return bool
     */
    function changeTolerance(
        uint256 _newTolerance
    ) external onlyRole(MANAGER_ROLE) gtZero(_newTolerance) returns (bool) {
        emit ToleranceChanged(msg.sender, _newTolerance);

        tolerance = _newTolerance;
        return true;
    }

    /**
     * @notice Changes fees amount to another amount.
     * Requirements:
     * - `msg.sender` must have `MANAGER_ROLE`
     * - `_newFees` must be > 0
     *
     * @param _newFees uint256
     * @return bool
     */
    function changeFees(uint256 _newFees) external onlyRole(MANAGER_ROLE) gtZero(_newFees) returns (bool) {
        emit FeesChanged(msg.sender, _newFees);

        fees = _newFees;
        return true;
    }
}
