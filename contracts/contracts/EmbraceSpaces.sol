// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "hardhat/console.sol";
import "./EmbraceAccounts.sol";

contract EmbraceSpaces {
    enum Visibility {
        PUBLIC,
        PRIVATE,
        ANONYMOUS
    }

    struct Space {
        uint256 index;
        bytes32 handle; // acts as spaceId
        Visibility visibility;
        uint128[] apps;
        string metadata;
        address founder;
    }

    struct Member {
        bool isAdmin;
        bool active;
    }

    uint256 private spaceIndex = 0;
    Space[] public spaces;

    EmbraceAccounts accounts;

    mapping(uint256 => mapping(address => Member)) public spaceMembers;
    mapping(uint256 => uint256) public spaceMemberLength;

    mapping(bytes32 => uint256) public spaceHandles;

    modifier onlySpaceAdmin(uint256 _spaceIndex) {
        require(isAdmin(_spaceIndex) || isFounder(_spaceIndex), "Only Admin user");
        _;
    }

    modifier onlySpaceFounder(uint256 _spaceIndex) {
        require(isFounder(_spaceIndex), "Only founder");
        _;
    }

    constructor(address _accountsAddress) {
        accounts = EmbraceAccounts(_accountsAddress);
    }

    function createSpace(
        bytes32 _handle,
        Visibility _visibility,
        uint128[] memory _apps,
        string memory _metadata
    ) public {
        if (spaceHandles[_handle] != 0) {
            revert("Handle already exists");
        }

        Space memory space = Space({
            index: spaceIndex,
            handle: _handle,
            visibility: _visibility,
            founder: msg.sender,
            apps: _apps,
            metadata: _metadata
        });

        spaces.push(space);

        // Add Handle
        spaceHandles[_handle] = spaceIndex;

        // Add space to founder's account
        accounts.addSpace(msg.sender, spaceIndex);
        spaceIndex++;
    }

    function joinPublicSpace(uint256 _spaceIndex) public returns (bool) {
        Space memory space = spaces[_spaceIndex];

        if (space.visibility != Visibility.PUBLIC) revert("Cannot join restricted space without permission");

        Member memory member = Member({ isAdmin: false, active: true });

        spaceMembers[_spaceIndex][msg.sender] = member;
        spaceMemberLength[_spaceIndex]++;

        // Add space to account
        accounts.addSpace(msg.sender, spaceIndex);

        return true;
    }

    function getSpaces() public view returns (Space[] memory) {
        return spaces;
    }

    function getSpace(uint256 _spaceIndex) public view returns (Space memory) {
        return spaces[_spaceIndex];
    }

    function getIdFromHandle(bytes32 _handle) public view returns (uint256) {
        return spaceHandles[_handle];
    }

    function isAdmin(uint256 _spaceIndex) public view returns (bool) {
        if (spaceMembers[_spaceIndex][msg.sender].isAdmin == true) {
            return true;
        }

        return false;
    }

    function isFounder(uint256 _spaceIndex) public view returns (bool) {
        Space memory space = spaces[_spaceIndex];

        return space.founder == msg.sender;
    }

    function addAdmin(uint256 _spaceIndex, address _address) public onlySpaceFounder(_spaceIndex) {
        Member memory member = Member({ isAdmin: true, active: true });
        spaceMembers[_spaceIndex][_address] = member;
    }

    function addMember(uint256 _spaceIndex, address _member) public onlySpaceAdmin(_spaceIndex) {
        Member memory member = Member({ isAdmin: false, active: true });
        spaceMembers[_spaceIndex][_member] = member;
    }

    function removeMember(uint256 _spaceIndex, address _member) public onlySpaceAdmin(_spaceIndex) {
        Member memory member = Member({ isAdmin: false, active: false });
        spaceMembers[_spaceIndex][_member] = member;
    }

    function addApp(uint256 _spaceIndex, uint128 _appIndex) public onlySpaceAdmin(_spaceIndex) {
        Space storage space = spaces[_spaceIndex];

        if (space.apps[_appIndex] == 0) {
            space.apps.push(_appIndex);
        }
    }

    function removeApp(uint256 _spaceIndex, uint256 _appIndex) public onlySpaceAdmin(_spaceIndex) {
        Space storage space = spaces[_spaceIndex];

        for (uint256 i = 0; i < space.apps.length; i++) {
            if (space.apps[i] == _appIndex) {
                delete space.apps[i];
            }
        }
    }
}
