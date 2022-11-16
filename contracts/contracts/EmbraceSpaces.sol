// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

// import "hardhat/console.sol";
import "./EmbraceAccounts.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EmbraceSpaces {
    using Counters for Counters.Counter;

    Counters.Counter private _spaceIdCounter;

    event SpaceCreated(uint256 indexed spaceId, address indexed founder);
    event JoinedSpace(uint256 indexed spaceId, address indexed memberAddress, bool isAdmin);
    event RequestJoinSpace(uint256 indexed spaceId, address indexed memberAddress);
    event RemovedFromSpace(uint256 indexed spaceId, address indexed memberAddress);

    error ErrorHandleExists(bytes32 handle);
    error ErrorMemberAlreadyExists(uint256 spaceId, address memberAddress);
    error ErrorOnlyAdmin(uint256 spaceId, address memberAddress);
    error ErrorOnlyFounder(uint256 spaceId, address memberAddress);
    error ErrorCannotJoinAnonSpace(uint256 spaceId, address memberAddress);
    error ErrorCannotJoinPrivClosedSpace(uint256 spaceId, address memberAddress);
    error ErrorDoNotMeetSpaceReq(uint256 spaceId, address memberAddress);

    enum Visibility {
        PUBLIC,
        PRIVATE,
        ANONYMOUS
    }

    enum Access {
        OPEN, // Public only
        GATED, // Public or Private
        CLOSED // Private and all Anonymous
    }

    enum MembershipGateToken {
        NONE,
        ERC20,
        ERC721,
        ERC1155
    }

    struct MembershipGate {
        // uint256 chainId;
        MembershipGateToken token;
        address tokenAddress;
    }

    struct Membership {
        Access access;
        MembershipGate gate;
        // Only relevant if space is Private and MemberType is Closed
        // If true allow requests to join / if false only Admin's can add members
        bool allowRequests;
    }

    struct Space {
        uint256 id;
        bytes32 handle;
        address founder;
        Visibility visibility;
        Membership membership;
        uint128[] apps;
        string metadata;
    }

    struct Member {
        bool isAdmin;
        bool isActive;
        bool isRequest;
    }

    Space[] public spaces;

    EmbraceAccounts accounts;

    mapping(uint256 => mapping(address => Member)) public spaceMembers;
    mapping(uint256 => uint256) public spaceMemberLength;

    mapping(bytes32 => uint256) public spaceHandles;

    modifier onlySpaceAdmin(uint256 _spaceId) {
        if (isAdmin(_spaceId) || isFounder(_spaceId)) revert ErrorOnlyAdmin(_spaceId, msg.sender);
        _;
    }

    modifier onlySpaceFounder(uint256 _spaceId) {
        if (isFounder(_spaceId)) revert ErrorOnlyFounder(_spaceId, msg.sender);
        _;
    }

    constructor(address _accountsAddress) {
        accounts = EmbraceAccounts(_accountsAddress);
    }

    function isAdmin(uint256 _spaceId) public view returns (bool) {
        if (spaceMembers[_spaceId][msg.sender].isAdmin == true) {
            return true;
        }

        return false;
    }

    function isFounder(uint256 _spaceId) public view returns (bool) {
        Space memory space = spaces[_spaceId];

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
            revert ErrorHandleExists(_handle);
        }

        uint256 spaceId = _spaceIdCounter.current();

        Space memory space = Space({
            id: spaceId,
            founder: msg.sender,
            handle: _handle,
            visibility: _visibility,
            membership: _membership,
            apps: _apps,
            metadata: _metadata
        });

        spaces.push(space);

        // Add Handle only if one is provided - anonymous spaces do not have handles
        spaceHandles[_handle] = spaceId;

        // Add space to founder's account
        accounts.addSpace(msg.sender, spaceId);

        // Set founder as the first admin member
        spaceMemberLength[spaceId]++;
        spaceMembers[spaceId][msg.sender] = Member({ isAdmin: true, isActive: true, isRequest: false });

        _spaceIdCounter.increment();

        emit SpaceCreated(spaceId, msg.sender);
    }

    function joinSpace(uint256 _spaceId) public returns (bool) {
        Space memory space = spaces[_spaceId];

        // Ensure not already a member
        if (spaceMembers[_spaceId][msg.sender].isActive == true) revert ErrorMemberAlreadyExists(_spaceId, msg.sender);
        // Cannot join anon space
        if (space.visibility == Visibility.ANONYMOUS) revert ErrorCannotJoinAnonSpace(_spaceId, msg.sender);
        // Cannot join private closed space
        if (space.visibility == Visibility.PRIVATE && space.membership.access == Access.CLOSED)
            revert ErrorCannotJoinPrivClosedSpace(_spaceId, msg.sender);
        // Make sure address meets the token requirements
        if (space.membership.access == Access.GATED && !meetsGateRequirements(_spaceId))
            revert ErrorDoNotMeetSpaceReq(_spaceId, msg.sender);

        // In all cases, if the requirements above are met then this will allow the address to auto-join the space
        Member memory member = Member({ isAdmin: false, isActive: true, isRequest: false });

        spaceMembers[_spaceId][msg.sender] = member;
        spaceMemberLength[_spaceId]++;

        emit JoinedSpace(_spaceId, msg.sender, false);

        // Add space to account
        accounts.addSpace(msg.sender, _spaceId);

        return true;
    }

    function requestJoin(uint256 _spaceId) public returns (bool) {
        // TODO: Add check to see if request is already pending
        if (spaceMembers[_spaceId][msg.sender].isActive == true) revert ErrorMemberAlreadyExists(_spaceId, msg.sender);

        Space memory space = spaces[_spaceId];

        // Ensure space is private, closed and allows requests
        if (
            space.visibility != Visibility.PRIVATE ||
            space.membership.access != Access.CLOSED ||
            !space.membership.allowRequests
        ) revert ErrorCannotJoinPrivClosedSpace(_spaceId, msg.sender);

        // Add membership request
        Member memory member = Member({ isAdmin: false, isActive: false, isRequest: true });
        spaceMembers[_spaceId][msg.sender] = member;

        emit RequestJoinSpace(_spaceId, msg.sender);

        return true;
    }

    function meetsGateRequirements(uint256 _spaceId) public view returns (bool) {
        Space memory space = spaces[_spaceId];
        address tokenAddress = space.membership.gate.tokenAddress;

        if (space.membership.gate.token == MembershipGateToken.ERC20) {
            ERC20 token = ERC20(tokenAddress);
            return token.balanceOf(msg.sender) > 0;
        } else if (space.membership.gate.token == MembershipGateToken.ERC721) {
            ERC721 token = ERC721(tokenAddress);
            return token.balanceOf(msg.sender) > 0;
        } else if (space.membership.gate.token == MembershipGateToken.ERC1155) {
            ERC1155 token = ERC1155(tokenAddress);
            return token.balanceOf(msg.sender, 0) > 0;
        }

        return false;
    }

    function getSpaceMember(uint256 _spaceId, address _address) public view returns (Member memory) {
        return spaceMembers[_spaceId][_address];
    }

    function getSpaces() public view returns (Space[] memory) {
        return spaces;
    }

    function getSpace(uint256 _spaceId) public view returns (Space memory) {
        return spaces[_spaceId];
    }

    function getSpaceFromHandle(bytes32 _handle) public view returns (Space memory) {
        uint256 _spaceId = getIdFromHandle(_handle);
        return spaces[_spaceId];
    }

    function getIdFromHandle(bytes32 _handle) public view returns (uint256) {
        return spaceHandles[_handle];
    }

    function getMemberCount(uint256 _spaceId) public view returns (uint256) {
        return spaceMemberLength[_spaceId];
    }

    // This method can be used to
    // 1- add a new member
    // 2- add or remove admin privileges (_isAdmin)
    // 3- activate or deactivate a member (_isActive)
    function setMember(
        uint256 _spaceId,
        address _address,
        bool _isActive,
        bool _isAdmin
    ) public onlySpaceAdmin(_spaceId) {
        // Ensures that the member struct has some changes
        if (
            spaceMembers[_spaceId][_address].isActive == _isActive &&
            spaceMembers[_spaceId][_address].isAdmin == _isAdmin
        ) {
            revert ErrorMemberAlreadyExists(_spaceId, _address);
        }

        // Will set the member struct to the new values
        Member memory member = Member({ isAdmin: _isAdmin, isActive: _isActive, isRequest: false });
        spaceMembers[_spaceId][_address] = member;

        // TODO: Need to emit JoinedSpace event only when the account is being added for first time
        // I.e. account could exist but be set as an admin

        // If the member is being activated then increment the member count
        if (_isActive) {
            spaceMemberLength[_spaceId]++;
            emit JoinedSpace(_spaceId, msg.sender, _isAdmin);
        } else {
            // If the member is being deactivated then decrement the member count
            spaceMemberLength[_spaceId]--;
            emit RemovedFromSpace(_spaceId, msg.sender);
        }
    }

    // Allows the founder to set founder to another address if required
    // I.e. Founder changes wallet OR space setup on behalf of founder, then transferred to them
    function setFounder(uint256 _spaceId, address _address) public onlySpaceFounder(_spaceId) {
        Space storage space = spaces[_spaceId];

        space.founder = _address;
    }

    function addApp(uint256 _spaceId, uint128 _appId) public onlySpaceAdmin(_spaceId) {
        Space storage space = spaces[_spaceId];

        if (space.apps[_appId] == 0) {
            space.apps.push(_appId);
        }
    }

    function removeApp(uint256 _spaceId, uint256 _appId) public onlySpaceAdmin(_spaceId) {
        Space storage space = spaces[_spaceId];

        for (uint256 i = 0; i < space.apps.length; i++) {
            if (space.apps[i] == _appId) {
                delete space.apps[i];
            }
        }
    }
}
