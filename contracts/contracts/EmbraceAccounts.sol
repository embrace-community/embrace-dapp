// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

/// Serves currently 1 purpos
/// - Saving the space's related to that account (used on the index page)
/// - No longer using handle for an account, instead we will use lens and ENS
contract EmbraceAccounts {
    mapping(address => uint256[]) spaces;

    function addSpace(address _address, uint256 _spaceId) public {
        uint256[] storage addressSpaces = spaces[_address];

        // Only add space if index doesn't already exist
        // TODO: Could this be more gas efficient?
        for (uint256 i = 0; i < addressSpaces.length; i++) {
            if (addressSpaces[i] == _spaceId) {
                return;
            }
        }

        addressSpaces.push(_spaceId);
    }

    function getSpaces(address _address) public view returns (uint256[] memory) {
        return spaces[_address];
    }
}
