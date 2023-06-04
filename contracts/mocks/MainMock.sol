// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../escrow/interfaces/IEscrow.sol";
import "../tokens/ERC20/interfaces/IMCGR.sol";

contract MainMock {
    IEscrow public escrow;
    IMCGR public mcgr;
    constructor(IEscrow _escrow, IMCGR _mcgr) {
        escrow = _escrow;
        mcgr = _mcgr;
    }

    function send(address user, uint256 tokenId , uint256 paidAmount) public {
        mcgr.transferFrom(user, address(escrow), paidAmount);
        escrow.sendFundsToSupplier(user, tokenId, paidAmount);
    }
}
