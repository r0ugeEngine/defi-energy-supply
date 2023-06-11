// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./manager/interfaces/IManager.sol";

/**
 * @title Parent contract for each contracts.
 * @author Bohdan
 */
abstract contract Parent is AccessControl {
    /// @dev Manager contract
    IManager public manager;

    /// @dev Throws if passed value is <= 0
    modifier gtZero(uint256 value) {
        require(value > 0, "Parent: passed value is <= 0");
        _;
    }

    /// @dev Throws if passed address 0 as parameter
    modifier zeroAddressCheck(address account) {
        require(account != address(0), "Parent: account is address 0");
        _;
    }

    /**
     * @notice Constructor to initialize Parent contract.
     * @dev Sets `manager` link.
     */
    constructor(IManager _manager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        manager = _manager;
    }

    /// @dev Changes `manager` address to the `_newManager` address.
    /// @param _newManager The address of the new manger contract
    function changeManager(
        IManager _newManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) zeroAddressCheck(address(_newManager)) {
        manager = _newManager;
    }
}
