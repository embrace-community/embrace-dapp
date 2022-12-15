// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "hardhat/console.sol";
import "./AppCreationsCollection.sol"; // Includes IEmbraceSpaces

contract AppCreations is IEmbraceSpaces {
    struct Collection {
        uint128 id;
        address contractAddress;
        string name;
    }

    mapping(uint256 => Collection[]) public spaceCollections;
    mapping(uint256 => uint64) public spaceToCollectionCount;

    error ErrorOnlyAdmin(uint256 spaceId, address memberAddress);

    event CollectionCreated(uint256 indexed spaceId, address indexed creator, Collection collection);

    address public embraceSpacesAddress;

    constructor(address _embraceSpacesAddress) {
        embraceSpacesAddress = _embraceSpacesAddress;
    }

    modifier onlySpaceAdmin(uint256 _spaceId) {
        if (!isAdminExternal(_spaceId, msg.sender) && !isFounderExternal(_spaceId, msg.sender))
            revert ErrorOnlyAdmin(_spaceId, msg.sender);
        _;
    }

    function isAdminExternal(uint256 _spaceId, address _address) public view returns (bool) {
        return IEmbraceSpaces(embraceSpacesAddress).isAdminExternal(_spaceId, _address);
    }

    function isFounderExternal(uint256 _spaceId, address _address) public view returns (bool) {
        return IEmbraceSpaces(embraceSpacesAddress).isFounderExternal(_spaceId, _address);
    }

    // Only space admins can create a collection for the space
    function createCollection(
        uint256 _spaceId,
        string memory _name,
        string memory _symbol
    ) public onlySpaceAdmin(_spaceId) {
        // Create new ERC721 collection contract
        AppCreationsCollection newCollection = new AppCreationsCollection(
            embraceSpacesAddress,
            _spaceId,
            _name,
            _symbol
        );

        // Increment collection count for space
        // Used for collection id - we start at 1, so we increment before pushing to array
        spaceToCollectionCount[_spaceId]++;

        Collection memory collection = Collection({
            id: spaceToCollectionCount[_spaceId],
            contractAddress: address(newCollection),
            name: _name
        });

        spaceCollections[_spaceId].push(collection);

        // Event for collection creation
        emit CollectionCreated(_spaceId, msg.sender, collection);
    }

    function getCollection(uint256 _spaceId, uint128 _id) public view returns (Collection memory) {
        uint128 index = _id - 1;
        return spaceCollections[_spaceId][index];
    }

    function getCollectionCount(uint256 _spaceId) public view returns (uint64) {
        return spaceToCollectionCount[_spaceId];
    }

    function getCollections(uint256 _spaceId) public view returns (Collection[] memory) {
        return spaceCollections[_spaceId];
    }
}
