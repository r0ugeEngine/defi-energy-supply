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

    /**
     * @notice Constructor to initialize Parent contract.
     * @dev Sets `manager` link.
     */
    constructor(IManager _manager) {
        manager = _manager;
    }

    /// @dev Changes `manager` address to the `_newManager` address.
    /// @param _newManager The address of the new manger contract
    function changeManager(IManager _newManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        manager = _newManager;
    }
}
