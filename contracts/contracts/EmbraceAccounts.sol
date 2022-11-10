// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

// import "hardhat/console.sol";

/// Serves currently 2 purposes
/// - Saving the space's related to that account (used on the index page)
/// - Enabling the account to create a handle for themselves if they wish (for example this could show on the members page instead of their address)
contract EmbraceAccounts {
    mapping(address => string) addressToString;
    mapping(string => address) stringToAddress;
    mapping(address => uint256[]) spaces;

    function addAccount(string memory _userHandle) public {
        addressToString[msg.sender] = _userHandle;
        _addHandle(_userHandle);
    }

    function addSpace(address _address, uint256 _spaceIndex) public {
        spaces[_address].push(_spaceIndex);
    }

    function getSpaces(address _address) public view returns (uint256[] memory) {
        return spaces[_address];
    }

    function _addHandle(string memory _userHandle) internal {
        stringToAddress[_userHandle] = msg.sender;
    }

    function getHandle(address _userAddress) public view returns (string memory) {
        return addressToString[_userAddress];
    }

    function getAddress(string memory _userHandle) public view returns (address) {
        return stringToAddress[_userHandle];
    }
}
