// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IEscrow
 * @dev Interface for the Escrow contract.
 * @author Bohdan
 */
interface IEscrow {
    /**
     * @notice Sends funds to the supplier for the energy consumed by a user.
     * @param user The address of the user.
     * @param tokenId The ID of the token.
     * @param supplier The address of the supplier.
     * @param paidAmount The amount of funds sent by the user.
     */
    function sendFundsToSupplier(address user, uint256 tokenId, address supplier, uint256 paidAmount) external;
}
