// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IEscrow {
    function sendFundsToSupplier(address user, uint256 tokenId, address supplier, uint256 paidAmount) external;
}
