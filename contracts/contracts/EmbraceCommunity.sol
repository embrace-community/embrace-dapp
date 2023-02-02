// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "hardhat/console.sol";
import "./Types.sol";
import "./TablelandCommunity.sol";

interface IEmbraceCommunities {
    function ownerOf(uint256 _tokenId) external view returns (address);
}

contract EmbraceCommunity is ERC721URIStorageUpgradeable, ERC721HolderUpgradeable, TablelandCommunity {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private memberTokenId;
    CountersUpgradeable.Counter private burnCount; // Number of times a members NFT has been burned / left the community

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

    // NFT related
    string private baseUri;
    mapping(address => uint256) public memberToTokenId;

    // Admin related
    mapping(address => bool) private admins;

    // Community Data related
    uint256 private communityId;
    string private handle;
    Visibility private visibility;
    Membership private membership;
    uint128[] private apps;

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
        address _tablelandRegistryAddress,
        uint256 _communityId,
        CommunityContractData memory _communityContractData
    ) public initializer {
        __ERC721_init(_name, _symbol);
        __TablelandCommunity_init(_tablelandRegistryAddress, _communityId);
        communitiesContractAddress = IEmbraceCommunities(_communitiesContractAddress);
        communityId = _communityId;

        // Set Member NFT token URI - currently Tableland
        _setBaseURI(_getTablelandBaseURI());

        // Set Community contract data
        _setCommunityContractData(_communityContractData);

        // Add Founder as first member
        _addMember(_founderAddress);
        admins[_founderAddress] = true;
    }

    // SETTER FUNCTIONS
    function join() public {
        if (membership.access != Access.OPEN) revert ErrorNotOpenAccess(msg.sender);
        if (memberToTokenId[msg.sender] != 0) revert ErrorMemberExists(msg.sender);

        _addMember(msg.sender);
    }

    function joinGated() public {
        if (membership.access != Access.GATED) revert ErrorNotGatedAccess(msg.sender);
        if (memberToTokenId[msg.sender] != 0) revert ErrorMemberExists(msg.sender);
        if (!_meetsGateRequirements(msg.sender)) revert ErrorGatedRequirementsNotMet(msg.sender);

        _addMember(msg.sender);
    }

    // Admin can add members
    function addMember(address _memberAddress, bool _isAdmin) public onlyAdmin {
        if (memberToTokenId[_memberAddress] != 0) {
            revert ErrorMemberExists(_memberAddress);
        }

        _addMember(_memberAddress);

        if (_isAdmin) {
            admins[_memberAddress] = true;
        }
    }

    // Can be used to change the community contract data
    function setCommunityContractData(CommunityContractData memory _communityData) public onlyAdmin {
        _setCommunityContractData(_communityData);
    }

    // Can be used to change the community meta data - should this be on global community contract or in community contract?
    function setCommunityMetaData(CommunityMetaData memory _communityMetaData) public onlyAdmin {}

    function grantAdminRole(address _account) public memberExists(_account) onlyAdmin {
        if (admins[_account]) {
            revert ErrorAlreadyAdmin(_account);
        }

        admins[_account] = true;
    }

    function revokeAdminRole(address _account) public memberExists(_account) onlyAdmin {
        if (!admins[_account]) revert ErrorNotAdmin(_account);
        if (_account == getFounder()) revert ErrorCannotRemoveFounderAdmin(msg.sender);

        admins[_account] = false;
    }

    function setBaseURI(string memory _uri) public onlyFounder {
        baseUri = _uri;
    }

    // Tableland insert query
    function insertKeyValue(
        string calldata _key,
        string calldata _value,
        KeyValueEncryption _encryptionType
    ) public onlyAdmin {
        _insertKeyValue(_key, _value, _encryptionType);
    }

    // GETTER FUNCTIONS
    function isFounder() public view returns (bool) {
        return getFounder() == msg.sender;
    }

    function isAdmin() public view returns (bool) {
        return admins[msg.sender] || isFounder();
    }

    function getCommunityData() public view returns (CommunityContractData memory) {
        return CommunityContractData({ handle: handle, visibility: visibility, membership: membership, apps: apps });
    }

    function getTables() public view returns (Table[] memory) {
        Table[] memory _tables = new Table[](2);
        _tables[uint256(TableType.MEMBERS)] = tables[MEMBERS_TABLE];
        _tables[uint256(TableType.KEYVALUE)] = tables[KEY_VALUE_TABLE];

        return _tables;
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
        _removeMember(msg.sender);
    }

    // Admin can remove members
    function removeMember(address _memberAddress) public onlyAdmin {
        _removeMember(_memberAddress);
    }

    // PRIVATE / INTERNAL METHODS
    function _addMember(address _memberAddress) private {
        memberTokenId.increment();
        uint256 newMemberTokenId = memberTokenId.current();

        _mint(_memberAddress, newMemberTokenId);
        _insertMember(newMemberTokenId, _memberAddress);
        memberToTokenId[_memberAddress] = newMemberTokenId;
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _setCommunityContractData(CommunityContractData memory _communityData) private {
        handle = _communityData.handle;
        visibility = _communityData.visibility;
        membership = _communityData.membership;
        apps = _communityData.apps;
    }

    // TODO: Check whether account has a token
    // Both ERC20, ERC721 can use balanceOf(account) to see if greater than 0
    // ERC1155 can use balanceOf(account, tokenId) to see if greater than 0 - will need to know the token id
    // Will be more complex if we want to check a contract on a different chain
    function _meetsGateRequirements(address _account) private view returns (bool) {
        return true;
    }

    function _removeMember(address _account) private {
        uint256 tokenId = memberToTokenId[_account];
        if (tokenId == 0) revert ErrorNotMember(_account);
        if (_account == getFounder()) revert ErrorFounderCannotLeave(_account);

        _burn(tokenId);
        burnCount.increment();
        delete memberToTokenId[_account];
    }
}
