// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

// import "hardhat/console.sol";

contract EmbraceAccounts {
    mapping(address => string) addressToString;
    mapping(string => address) stringToAddress;

    function addAccount(string memory _userHandle) public {
        addressToString[msg.sender] = _userHandle;
        _addHandle(_userHandle);
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