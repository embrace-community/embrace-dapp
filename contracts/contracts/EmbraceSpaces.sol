// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

// import "hardhat/console.sol";

contract EmbraceSpaces {
    enum Visibility {
        PUBLIC,
        PRIVATE,
        ANONYMOUS
    }

    struct Space {
        bytes32 handle;
        Visibility visibility;
        uint128[] apps;
        string metadata;
        address founder;
        bytes32 passcode;
    }

    uint256 private spaceIndex = 1;
    Space[] public spaces;

    mapping(uint256 => mapping(address => bool)) public spaceMembers;
    mapping(uint256 => uint256) public spaceMemberLength;
    mapping(uint256 => mapping(address => bool)) public spaceAdmins;
    mapping(uint256 => uint256) public spaceAdminLength;

    mapping(bytes32 => uint256) public spaceHandles;

    modifier onlySpaceAdmin(uint256 _spaceIndex) {
        require(isAdmin(_spaceIndex) || isFounder(_spaceIndex), "Only Admin user");
        _;
    }

    modifier onlySpaceFounder(uint256 _spaceIndex) {
        require(isFounder(_spaceIndex), "Only founder");
        _;
    }

    function createSpace(
        bytes32 _handle,
        Visibility _visibility,
        uint256[] memory _apps,
        string memory _metadata,
        string memory _passstring
    ) public {
        if (spaceHandles[_handle] != 0) {
            revert("Handle already exists");
        }

        Space memory space = Space({
            handle: _handle,
            visibility: _visibility,
            founder: msg.sender,
            apps: _apps,
            metadata: _metadata,
            // TODO: This is just a temporary (unsecure) version
            // which will be replaced with another mechanism
            // like DAO membership etc.
            passcode: keccak256(abi.encodePacked(_passstring))
        });

        spaces.push(space);

        // Add Handle
        spaceHandles[_handle] = spaceIndex;
        spaceIndex++;
    }

    function joinPublicSpace(uint256 _spaceIndex) public returns (bool) {
        Space memory space = spaces[_spaceIndex];

        if (space.visibility != Visibility.PUBLIC) revert("Cannot join restricted space without passcode");

        spaceMembers[_spaceIndex][msg.sender] = true;
        spaceMemberLength[_spaceIndex]++;

        return true;
    }

    function joinRestrictedSpace(uint256 _spaceIndex, string memory _passstring) public {
        Space memory space = spaces[_spaceIndex];

        if (space.passcode != keccak256(abi.encodePacked(_passstring))) revert("Wrong passcode provided");

        spaceMembers[_spaceIndex][msg.sender] = true;
        spaceMemberLength[_spaceIndex]++;
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
        if (spaceAdmins[_spaceIndex][msg.sender] == true) {
            return true;
        }

        return false;
    }

    function isFounder(uint256 _spaceIndex) public view returns (bool) {
        Space memory space = spaces[_spaceIndex];

        return space.founder == msg.sender;
    }

    function addSpaceAdmin(uint256 _spaceIndex, address _admin) public onlySpaceFounder(_spaceIndex) {
        spaceAdmins[_spaceIndex][_admin] = true;
    }

    function addSpaceMember(uint256 _spaceIndex, address _member) public onlySpaceAdmin(_spaceIndex) {
        spaceMembers[_spaceIndex][_member] = true;
    }

    function addApp(uint256 _spaceIndex, uint256 _appIndex) public onlySpaceAdmin(_spaceIndex) {
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
