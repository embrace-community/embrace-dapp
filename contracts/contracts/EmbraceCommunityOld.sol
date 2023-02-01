// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "hardhat/console.sol";
import "./Types.sol";

interface IEmbraceCommunities {
    function ownerOf(uint256 _tokenId) external view returns (address);
}

// TODO Setup AccessControls - Admin role, Default Admin role assigned to Founder
contract EmbraceCommunityOld is ERC721URIStorageUpgradeable, ERC721HolderUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private memberTokenId;

    error ErrorTableExists(string tableName);
    error ErrorTableDoesNotExist(string tableName);
    error ErrorMemberExists(address member);
    error ErrorMemberDoesNotExist(address member);
    error ErrorAlreadyAdmin(address member);
    error ErrorNotAdmin(address member);
    error ErrorNotFounder(address member);
    error ErrorNotOpenAccess(address account);
    error ErrorNotGatedAccess(address account);
    error ErrorGatedRequirementsNotMet(address account);
    error ErrorCannotRemoveFounderAdmin(address account);

    enum TableType {
        MEMBERS,
        KEYVALUE
    }

    struct Table {
        TableType tableType; // Members | Key Value
        uint256 id; // Tableland id
        string name; // Tableland name
        string prefix; // Prefix for this communities version of the table
    }

    mapping(bytes8 => Table) public tables;
    bytes8 private constant MEMBERS_TABLE = bytes8("MEMBERS");
    bytes8 private constant KEY_VALUE_TABLE = bytes8("KEYVALUE");

    string private baseTablePrefix;
    ITablelandTables private tableland;

    enum KeyValueEncryption {
        None,
        Founder,
        Admin,
        Member,
        Account
    }

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
        communityId = _communityId;

        communitiesContractAddress = IEmbraceCommunities(_communitiesContractAddress);

        tableland = ITablelandTables(_tablelandRegistryAddress);

        baseTablePrefix = string.concat("embrace_community_", Strings.toString(communityId));

        // Set Community contract data
        _setCommunityContractData(_communityContractData);

        // Create the community member table
        _createMemberTable();

        // Set Member NFT token URI
        string memory _tokenQuery = string.concat("SELECT+*+FROM+", tables[MEMBERS_TABLE].name, "+WHERE+id+%3D+");
        _setBaseURI(string.concat("https://testnets.tableland.network/query?unwrap=true&s=", _tokenQuery));

        // Add Founder as first member
        _addMember(_founderAddress);
        admins[_founderAddress] = true;

        // Create Community Key Value store
        _createKeyValueTable();
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

    // Tableland insert query
    function insertKeyValue(
        string calldata _key,
        string calldata _value,
        KeyValueEncryption _encryptionType
    ) public onlyAdmin {
        Table memory keyValueTable = tables[KEY_VALUE_TABLE];

        if (keyValueTable.id == 0) {
            revert ErrorTableDoesNotExist("Key Value Table");
        }

        // Prepare SQL
        string memory accountString = StringsUpgradeable.toHexString(msg.sender); // TODO: Costly - is account address needed?
        string memory dateCreatedString = StringsUpgradeable.toString(block.timestamp);
        string memory encryptionTypeString = StringsUpgradeable.toString(uint256(_encryptionType));

        string memory sql = SQLHelpers.toInsert(
            keyValueTable.prefix,
            keyValueTable.id,
            "k, v, account, encryption, dateCreated",
            string.concat(
                SQLHelpers.quote(_key),
                ",",
                SQLHelpers.quote(_value),
                ",",
                SQLHelpers.quote(accountString),
                ",",
                SQLHelpers.quote(encryptionTypeString),
                ",",
                SQLHelpers.quote(dateCreatedString)
            )
        );

        if (block.chainid == 31337) {
            console.log("Inserting member: %s", sql);
            return;
        }
        // Run Query
        tableland.runSQL(address(this), keyValueTable.id, sql);
    }

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
        return memberTokenId.current();
    }

    // PRIVATE / INTERNAL METHODS
    function _addMember(address _memberAddress) private {
        memberTokenId.increment();
        uint256 newMemberTokenId = memberTokenId.current();

        _mint(_memberAddress, newMemberTokenId);
        _insertMember(newMemberTokenId);
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

    // Tableland Table
    function _createMemberTable() private {
        Table storage membersTable = tables[MEMBERS_TABLE];

        if (membersTable.id != 0) {
            revert ErrorTableExists(membersTable.name);
        }

        membersTable.tableType = TableType.MEMBERS;
        membersTable.prefix = string.concat(baseTablePrefix, "_members");

        membersTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("id INTEGER PRIMARY KEY, account TEXT, dateCreated TEXT", membersTable.prefix)
        );

        membersTable.name = SQLHelpers.toNameFromId(membersTable.prefix, membersTable.id);
    }

    // Tableland Table
    function _createKeyValueTable() internal {
        Table storage keyValueTable = tables[KEY_VALUE_TABLE];

        if (keyValueTable.id != 0) {
            revert ErrorTableExists(keyValueTable.name);
        }

        keyValueTable.tableType = TableType.KEYVALUE;
        keyValueTable.prefix = string.concat(baseTablePrefix, "_key_value");

        // TODO: Encryption = 0 = NONE, 1 = FOUNDER, 2 = ADMIN, 3 = MEMBER, 4 = ACCOUNT (that added key)
        keyValueTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(
                "k TEXT PRIMARY KEY, v TEXT, account TEXT, encryption INTEGER, dateCreated TEXT",
                keyValueTable.prefix
            )
        );

        keyValueTable.name = SQLHelpers.toNameFromId(keyValueTable.prefix, keyValueTable.id);
    }

    // Tableland insert query
    function _insertMember(uint256 _memberId) internal {
        Table memory memberTable = tables[MEMBERS_TABLE];

        if (memberTable.id == 0) {
            revert ErrorTableDoesNotExist("Members Table");
        }
        // Prepare SQL
        string memory memberIdString = StringsUpgradeable.toString(_memberId);
        string memory accountString = StringsUpgradeable.toHexString(msg.sender); // TODO: Costly - is account address needed?
        string memory dateCreatedString = StringsUpgradeable.toString(block.timestamp);

        string memory sql = SQLHelpers.toInsert(
            memberTable.prefix,
            memberTable.id,
            "id, account, dateCreated",
            string.concat(
                memberIdString,
                ",",
                SQLHelpers.quote(accountString),
                ",",
                SQLHelpers.quote(dateCreatedString)
            )
        );

        if (block.chainid == 31337) {
            console.log("Inserting member: %s", sql);
            return;
        }
        // Run Query
        tableland.runSQL(address(this), memberTable.id, sql);
    }
}
