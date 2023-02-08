// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "hardhat/console.sol";
import "./Interfaces.sol";

error ErrorMemberExists(address member);
error ErrorMemberDoesNotExist(address member);
error ErrorAlreadyAdmin(address member);
error ErrorNotAdmin(address member);
error ErrorNotFounder(address member);
error ErrorNotOpenAccess(address account);
error ErrorNotGatedAccess(address account);
error ErrorGatedRequirementsNotMet(address account);
error ErrorCannotRemoveFounderAdmin(address account);
error ErrorNotMember(address account);
error ErrorFounderCannotLeave(address account);

contract EmbraceCommunity is ERC721URIStorageUpgradeable, ERC721HolderUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private memberTokenId;
    CountersUpgradeable.Counter private burnCount; // Number of times a members NFT has been burned / left the community

    event MemberAdded(uint256 communityId, uint256 tokenId, address member);
    event MemberRemoved(uint256 communityId, uint256 tokenId, address member);
    event AdminAdded(uint256 communityId, address member);
    event AdminRemoved(uint256 communityId, address member);

    // NFT related
    string private baseUri;
    mapping(address => uint256) public memberToTokenId;

    // Admin related
    mapping(address => bool) private admins;

    // Community Data related
    uint256 private communityId;
    string private handle;
    uint128[] private apps; // TODO: Is apps needed?
    string private metadata;
    Visibility private visibility;
    Access private access;
    MembershipGate private membershipGate;
    // bool private allowRequests;

    // Required to access the global contract to find the owner / founder of the community
    IEmbraceCommunities private communitiesContractAddress;

    struct MemberStatus {
        bool isFounder;
        bool isAdmin;
        bool isMember;
    }

    // MODIFIERS
    // Can only be used after the community as been created
    modifier onlyFounder() {
        if (getFounder() != msg.sender) {
            revert ErrorNotFounder(msg.sender);
        }
        _;
    }

    modifier onlyAdmin() {
        if (!isAdmin()) {
            revert ErrorNotAdmin(msg.sender);
        }
        _;
    }

    modifier memberExists(address _member) {
        if (memberToTokenId[_member] == 0) {
            revert ErrorMemberDoesNotExist(msg.sender);
        }
        _;
    }

    // initializer instead on constructor
    function initialize(
        string memory _name,
        string memory _symbol,
        address _founderAddress,
        address _communitiesContractAddress,
        uint256 _communityId,
        CommunityData memory _communityData
    ) public initializer {
        __ERC721_init(_name, _symbol);
        communitiesContractAddress = IEmbraceCommunities(_communitiesContractAddress);
        communityId = _communityId;

        // Set Member NFT token URI - currently Tableland
        _setBaseURI("ipfs://");

        // Set Community contract data
        _setCommunityData(_communityData);

        // Add Founder as first member
        _memberAdd(_founderAddress);
        _adminAdd(_founderAddress);
    }

    // SETTER FUNCTIONS
    function join() public {
        if (access != Access.OPEN) revert ErrorNotOpenAccess(msg.sender);
        if (memberToTokenId[msg.sender] != 0) revert ErrorMemberExists(msg.sender);

        _memberAdd(msg.sender);
    }

    function joinGated() public {
        if (access != Access.GATED) revert ErrorNotGatedAccess(msg.sender);
        if (memberToTokenId[msg.sender] != 0) revert ErrorMemberExists(msg.sender);
        if (!_meetsGateRequirements(msg.sender)) revert ErrorGatedRequirementsNotMet(msg.sender);

        _memberAdd(msg.sender);
    }

    // Admin can add members
    function memberAdd(address _memberAddress, bool _isAdmin) public onlyAdmin {
        if (memberToTokenId[_memberAddress] != 0) {
            revert ErrorMemberExists(_memberAddress);
        }

        _memberAdd(_memberAddress);

        // Sets the member as an admin if true
        if (_isAdmin) {
            _adminAdd(_memberAddress);
        }
    }

    // Can be used to change the community contract data
    function setCommunityData(CommunityData memory _communityData) public onlyAdmin {
        _setCommunityData(_communityData);
    }

    function adminAdd(address _account) public memberExists(_account) onlyAdmin {
        _adminAdd(_account);
    }

    function adminRemove(address _account) public memberExists(_account) onlyAdmin {
        if (!admins[_account]) revert ErrorNotAdmin(_account);
        if (_account == getFounder()) revert ErrorCannotRemoveFounderAdmin(msg.sender);

        admins[_account] = false;

        emit AdminRemoved(communityId, _account);
    }

    function setBaseURI(string memory _uri) public onlyFounder {
        baseUri = _uri;
    }

    // Instead trigger en event
    function insertKeyValue(string calldata _key, string calldata _value) public onlyAdmin {
        // _insertKeyValue(_key, _value);
    }

    // GETTER FUNCTIONS
    function isFounder() public view returns (bool) {
        return getFounder() == msg.sender;
    }

    function isAdmin() public view returns (bool) {
        return admins[msg.sender] || isFounder();
    }

    function getCommunityData() public view returns (CommunityData memory) {
        return
            CommunityData({
                handle: handle,
                apps: apps,
                metadata: metadata,
                visibility: visibility,
                access: access,
                membershipGate: membershipGate
            });
    }

    function getMemberStatus(address _address) public view returns (MemberStatus memory) {
        bool isAccountFounder = getFounder() == _address;

        return
            MemberStatus({
                isMember: isAccountFounder || memberToTokenId[_address] != 0,
                isFounder: isAccountFounder,
                isAdmin: isAccountFounder || admins[_address]
            });
    }

    function getFounder() public view returns (address) {
        return communitiesContractAddress.ownerOf(communityId);
    }

    function getMemberTokenId(address _account) public view returns (uint256) {
        return memberToTokenId[_account];
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function totalSupply() public view returns (uint256) {
        return memberTokenId.current();
    }

    function totalMembers() public view returns (uint256) {
        // Total members should be the total supply minus the burned tokens
        return memberTokenId.current() - burnCount.current();
    }

    // Member can decide to leave
    function leave() public {
        _memberRemove(msg.sender);
    }

    // Admin can remove members
    function removeMember(address _memberAddress) public onlyAdmin {
        _memberRemove(_memberAddress);
    }

    // PRIVATE / INTERNAL METHODS
    function _memberAdd(address _memberAddress) private {
        memberTokenId.increment();
        uint256 newMemberTokenId = memberTokenId.current();

        _mint(_memberAddress, newMemberTokenId);

        memberToTokenId[_memberAddress] = newMemberTokenId;

        emit MemberAdded(communityId, newMemberTokenId, _memberAddress);
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _setCommunityData(CommunityData memory _communityData) private {
        handle = _communityData.handle;
        apps = _communityData.apps;
        metadata = _communityData.metadata;
        access = _communityData.access;
        visibility = _communityData.visibility;
        membershipGate = _communityData.membershipGate;
    }

    // TODO: Check whether account has a token
    // Both ERC20, ERC721 can use balanceOf(account) to see if greater than 0
    // ERC1155 can use balanceOf(account, tokenId) to see if greater than 0 - will need to know the token id
    // Will be more complex if we want to check a contract on a different chain
    function _meetsGateRequirements(address _account) private view returns (bool) {
        return true;
    }

    function _memberRemove(address _account) private {
        uint256 tokenId = memberToTokenId[_account];
        if (tokenId == 0) revert ErrorNotMember(_account);
        if (_account == getFounder()) revert ErrorFounderCannotLeave(_account);

        _burn(tokenId);
        burnCount.increment();
        delete memberToTokenId[_account];

        emit MemberRemoved(communityId, tokenId, _account);
    }

    function _adminAdd(address _account) internal {
        admins[_account] = true;

        emit AdminAdded(communityId, _account);
    }
}
