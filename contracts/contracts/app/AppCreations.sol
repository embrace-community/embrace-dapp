// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "hardhat/console.sol";
import "./AppCreationsCollection.sol";

contract AppCreations {
    struct Collection {
        uint128 id;
        address contractAddress;
        string name;
    }

    mapping(uint256 => Collection[]) public spaceCollections;
    mapping(uint256 => uint64) public spaceToCollectionCount;

    // TODO: Ownable / Admins + Founder should only be able to create collections for the space
    function createCollection(uint256 _spaceId, string memory _name, string memory _symbol) public {
        // Create new ERC721 collection contract
        AppCreationsCollection newCollection = new AppCreationsCollection(_spaceId, _name, _symbol);

        // Increment collection count for space
        // Used for collection id - we start at 1, so we increment before pushing to array
        spaceToCollectionCount[_spaceId]++;

        Collection memory collection = Collection({
            id: spaceToCollectionCount[_spaceId],
            contractAddress: address(newCollection),
            name: _name
        });

        spaceCollections[_spaceId].push(collection);

        console.log("createCollection", _spaceId, _name, address(newCollection));
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
