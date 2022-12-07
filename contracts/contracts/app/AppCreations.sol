// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "hardhat/console.sol";
import "./AppCreationsCollection.sol";

contract AppCreations {
    struct Collection {
        uint64 index;
        address collectionContract;
        string name;
    }

    mapping(uint256 => Collection[]) public spaceCollections;
    mapping(uint256 => uint64) public spaceToCollectionCount;

    // TODO: Ownable / Admins + Founder should only be able to create collections for the space
    function createCollection(uint256 _spaceId, string memory _name, string memory _symbol) public {
        // Create new ERC721 collection contract
        AppCreationsCollection newCollection = new AppCreationsCollection(_spaceId, _name, _symbol);

        Collection memory collection = Collection({
            index: spaceToCollectionCount[_spaceId],
            collectionContract: address(newCollection),
            name: _name
        });

        spaceCollections[_spaceId].push(collection);
        spaceToCollectionCount[_spaceId]++;
        console.log("createCollection", _spaceId, _name, address(newCollection));
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
