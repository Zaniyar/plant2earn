// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./IPlant.sol";

interface IPlantDrawer {
    /// @notice Produces the URI describing a particular Plant (token id)
    /// @dev Note this URI may be a data: URI with the JSON contents directly inlined
    /// @param plant The Plant contract
    /// @param tokenId The ID of the token for which to produce a description
    /// @return The URI of the ERC721-compliant metadata
    function tokenURI(IPlant plant, uint256 tokenId) external view returns (string memory);

}