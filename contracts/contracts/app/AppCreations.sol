// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "./AppCreationsCollection.sol";

contract AppCreations {
    struct Collection {
        uint64 index;
        address collectionContract;
        string name;
    }

    mapping(uint256 => Collection[]) public spaceCollections;
    mapping(uint256 => uint64) public spaceToCollectionCount;

    function createCollection(uint256 _spaceId, address _collectionContract, string memory _name) public {
        // Create new ERC721 collection contract
        AppCreationsCollection newCollection = new AppCreationsCollection(_name, "BLA", _spaceId);

        Collection memory collection = Collection({
            index: spaceToCollectionCount[_spaceId],
            collectionContract: _collectionContract,
            name: _name
        });

        spaceCollections[_spaceId].push(collection);
        spaceToCollectionCount[_spaceId]++;
    }

    function getCollection(uint256 _spaceId, uint64 _index) public view returns (Collection memory) {
        return spaceCollections[_spaceId][_index];
    }

    function getCollectionCount(uint256 _spaceId) public view returns (uint64) {
        return spaceToCollectionCount[_spaceId];
    }

    function getCollections(uint256 _spaceId) public view returns (Collection[] memory) {
        return spaceCollections[_spaceId];
    }
}
