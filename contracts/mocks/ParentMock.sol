// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "../Parent.sol";

contract ParentMock is  Parent{
    constructor(IManager _manager) Parent(_manager) {

    }
}