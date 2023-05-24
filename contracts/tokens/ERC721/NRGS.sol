// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./NFTTemplate.sol";

/**
 * @title Energy Supply token contract (ERC721 standard)
 * @author Bohdan
 */
contract NRGS is NFTTemplate {
    /// @notice Constructor to initialize NRGS contract
    /// @dev Grants each roles to `msg.sender`
    /// @dev Sets `name` and `symbol` of ERC721 token
    constructor() NFTTemplate("Energy Supply token", "NRGS") {}

    /// @dev Mints `to` address NRGS token
    /// @param to address to mint
    function mint(address to, uint256 tokenId) external onlyRole(MINTER_ROLE) {
        _safeMint(to, tokenId);
    }

    /// @dev Burns `from` address NRGS token
    /// @param tokenId uint256
    function burn(uint256 tokenId) public onlyRole(BURNER_ROLE) {
        _burn(tokenId);
    }
}
