// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

// import "hardhat/console.sol";
import "./EmbraceAccounts.sol";

contract EmbraceSpaces {
    enum Visibility {
        PUBLIC,
        PRIVATE,
        ANONYMOUS
    }

    enum MembershipType {
        OPEN, // Public only
        GATED, // Public or Private
        CLOSED // Private and all Anonymous
    }

    enum MembershipGateType {
        NONE,
        ERC20,
        ERC721,
        ERC1155
    }

    struct MembershipGate {
        // uint256 chainId;
        MembershipGateType gateType;
        address tokenAddress;
    }

    struct Membership {
        MembershipType kind;
        MembershipGate gate;
        // Only relevant if space is Private and MemberType is Closed
        // If true allow requests to join / if false only Admin's can add members
        bool allowRequests;
    }

    struct Space {
        uint256 index;
        bytes32 handle; // acts as spaceId
        Visibility visibility;
        Membership membership;
        uint128[] apps;
        string metadata;
        address founder;
    }

    struct Member {
        bool isAdmin;
        bool active;
        bool request;
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

    function createSpace(
        bytes32 _handle,
        Visibility _visibility,
        Membership memory _membership,
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
            membership: _membership,
            founder: msg.sender,
            apps: _apps,
            metadata: _metadata
        });

        spaces.push(space);

        // Add Handle
        spaceHandles[_handle] = spaceIndex;

        // Add space to founder's account
        accounts.addSpace(msg.sender, spaceIndex);

        // Set founder as the first admin member
        spaceMemberLength[spaceIndex]++;
        spaceMembers[spaceIndex][msg.sender] = Member({ isAdmin: true, active: true, request: false });

        spaceIndex++;
    }

    // TODO: Use Customer Errors instead of messages: https://blog.soliditylang.org/2021/04/21/custom-errors/
    function joinSpace(uint256 _spaceIndex) public returns (bool) {
        Space memory space = spaces[_spaceIndex];

        // Ensure not already a member
        if (spaceMembers[_spaceIndex][msg.sender].active == true) revert("You are already a member");
        // Cannot join anon space
        if (space.visibility == Visibility.ANONYMOUS) revert("You cannot join an anonymous space");
        // Cannot join private closed space
        if (space.visibility == Visibility.PRIVATE && space.membership.kind == MembershipType.CLOSED)
            revert("You cannot join a private closed space");
        // Make sure address meets the token requirements
        if (space.membership.kind == MembershipType.GATED && !meetsGateRequirements(_spaceIndex))
            revert("You do not meet the requirements for the gated space");

        // In all cases, if the requirements above are met then this will allow the address to auto-join the space
        bool membershipRequest = false;
        bool membershipActive = true;

        // However, if this is a private closed group then this is a membership request that needs to be confirmed by Admins
        if (space.visibility == Visibility.PRIVATE && space.membership.kind == MembershipType.OPEN) {
            membershipRequest = true;
            membershipActive = false;
        }

        Member memory member = Member({ isAdmin: false, active: membershipActive, request: membershipRequest });

        spaceMembers[_spaceIndex][msg.sender] = member;
        spaceMemberLength[_spaceIndex]++;

        // Add space to account
        accounts.addSpace(msg.sender, spaceIndex);

        return true;
    }

    function meetsGateRequirements(uint256 _spaceIndex) public view returns (bool) {
        Space memory space = spaces[_spaceIndex];
        address tokenAddress = space.membership.gate.tokenAddress;

        // TODO: check token address value / exists in address balance
        // How to check the value of ERC20 tokens on another chain to this one??
        if (tokenAddress != address(0)) {
            return true;
        }

        return false;
    }

    function getSpaces() public view returns (Space[] memory) {
        return spaces;
    }

    function getSpace(uint256 _spaceIndex) public view returns (Space memory) {
        return spaces[_spaceIndex];
    }

    function getSpaceFromHandle(bytes32 _handle) public view returns (Space memory) {
        uint256 _spaceIndex = getIdFromHandle(_handle);
        return spaces[_spaceIndex];
    }

    function getIdFromHandle(bytes32 _handle) public view returns (uint256) {
        return spaceHandles[_handle];
    }

    function getMemberCount(uint256 _spaceIndex) public view returns (uint256) {
        return spaceMemberLength[_spaceIndex];
    }

    function addAdmin(uint256 _spaceIndex, address _address) public onlySpaceFounder(_spaceIndex) {
        // If address is already an active member then just make them an admin
        if (spaceMembers[_spaceIndex][_address].active == true) {
            spaceMembers[_spaceIndex][_address].isAdmin = true;
        } else {
            // Otherwise add them as a new member and increment the member count
            Member memory member = Member({ isAdmin: true, active: true, request: false });
            spaceMembers[_spaceIndex][_address] = member;
            spaceMemberLength[_spaceIndex]++;
        }
    }

    function addMember(uint256 _spaceIndex, address _address) public onlySpaceAdmin(_spaceIndex) {
        if (spaceMembers[_spaceIndex][_address].active == true) {
            revert("Member already exists");
        }

        Member memory member = Member({ isAdmin: false, active: true, request: false });
        spaceMembers[_spaceIndex][_address] = member;
        spaceMemberLength[_spaceIndex]++;
    }

    // Allows the founder to set founder to another address if required
    // I.e. Founder changes wallet OR space setup on behalf of founder, then transferred to them
    function setFounder(uint256 _spaceIndex, address _address) public onlySpaceFounder(_spaceIndex) {
        Space storage space = spaces[_spaceIndex];

        space.founder = _address;
    }

    function removeMember(uint256 _spaceIndex, address _member) public onlySpaceAdmin(_spaceIndex) {
        if (spaceMembers[_spaceIndex][_member].active == false) {
            revert("Member does not exist");
        }

        Member memory member = Member({ isAdmin: false, active: false, request: false });
        spaceMembers[_spaceIndex][_member] = member;
        spaceMemberLength[_spaceIndex]--;
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
