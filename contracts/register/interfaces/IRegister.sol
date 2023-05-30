// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Interface for contract for registration of suppliers and users
 * @author Bohdan
 */
interface IRegister {
    /**
     * @notice Registers Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `supplier` must not be address 0
     * - `supplier` must have NRGS token
     *
     * @param supplier address
     * @param tokenId uint256
     * @return bool
     */
    function registerSupplier(address supplier, uint256 tokenId) external returns (bool);

    /**
     * @notice Registers Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `user` must not be address 0
     * - `user` must have NRGS token
     *
     * @param user address
     * @param tokenId uint256
     * @return bool
     */
    function registerElectricityUser(address user, uint256 tokenId, address supplier) external returns (bool);

    /**
     * @notice Unregisters Energy supplier.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `supplier` must not be address 0
     * - `supplier` must have NRGS token
     *
     * @param supplier address
     * @param tokenId uint256
     * @return bool
     */
    function unRegisterSupplier(address supplier, uint256 tokenId) external returns (bool);

    /**
     * @notice Unregisters Electricity user.
     * Requirements:
     * - `msg.sender` must have REGISTER_MANAGER_ROLE
     * - `user` must not be address 0
     * - `user` must have ELU token
     *
     * @param user address
     * @param tokenId uint256
     * @return bool
     */
    function unRegisterElectricityUser(address user, uint256 tokenId) external returns (bool);
}
