// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/// @title Plant NFTs Interface
interface IGameObject {
    /// @notice Details of the Plant that are relevant for playing
    struct Details {
        uint8 level;
        uint8 harvestCounter;
        uint8 wateringCounter;
        uint256 lastActionTimestamp;
        uint256 timestamp;
        address minter;
    }

    /// @notice Returns the details associated with a given token ID.
    /// @dev Throws if the token ID is not valid.
    /// @param tokenId The ID of the token that represents the Plant
    /// @return details memory
    function getDetails(uint256 tokenId)
        external
        view
        returns (Details memory details);
}
