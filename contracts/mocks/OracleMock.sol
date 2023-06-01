// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OracleMock {
    function getEnergyConsumption(address user, uint256 tokenId) public returns (uint256 consumption) {
        return 555;
    }
}
