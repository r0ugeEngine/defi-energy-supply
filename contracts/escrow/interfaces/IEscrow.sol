// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IEscrow
 * @dev Interface for the Escrow contract.
 * @author Bohdan
 */
interface IEscrow {
    /**
     * @dev Sends funds to the supplier for the energy consumed by a user.
     * Requirements:
     * - `msg.sender` must have `ESCROW_MANAGER_ROLE`
     * - `paidAmount` must be > 0
     * - `user` must be not address 0
     * - `supplier` must be not address 0
     *
     * @param user The address of the user.
     * @param supplierId The ID of the token.
     * @param supplier The address of the supplier.
     * @param paidAmount The amount of funds sent by the user.
     */
    function sendFundsToSupplier(address user, uint256 supplierId, address supplier, uint256 paidAmount) external;
}
