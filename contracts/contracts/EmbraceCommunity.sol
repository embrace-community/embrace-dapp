// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/utils/ERC721HolderUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
// import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "hardhat/console.sol";
import "./Types.sol";

interface IEmbraceCommunities {
    function ownerOf(uint256 _tokenId) external view returns (address);
}

// TODO Setup AccessControls - Admin role, Default Admin role assigned to Founder
contract EmbraceCommunity is ERC721URIStorageUpgradeable, ERC721HolderUpgradeable, AccessControlUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private memberTokenId;

    error ErrorTableExists(string tableName);
    error ErrorMemberExists(address member);

    struct Table {
        uint256 id;
        string name;
    }

    string private tablePrefix;

    ITablelandTables private tableland;

    Table public memberTable;
    Table public keyValueTable;

    string private baseUri;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address member;
    }

    uint256 private communityId;
    string private handle;
    Visibility private visibility;
    Membership private membership;
    uint128[] private apps;

    mapping(address => uint256) public memberToTokenId;

    IEmbraceCommunities private communitiesContract;

    function initialize(
        string memory _name,
        string memory _symbol,
        address _tablelandRegistryAddress,
        uint256 _communityId
    ) public initializer {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        __ERC721_init(_name, _symbol);
        communityId = _communityId;

        tableland = ITablelandTables(_tablelandRegistryAddress);

        tablePrefix = string.concat("embrace_community_", Strings.toString(communityId));

        // Create the community member table
        createMemberTable();

        // Set Member NFT token URI
        // TODO: Consider using ERC721Metadata format
        string memory _tokenQuery = string.concat("SELECT+*+FROM+", memberTable.name, "+WHERE+id+%3D+");

        _setBaseURI(string.concat("https://testnets.tableland.network/query?unwrap=true&s=", _tokenQuery));

        // Create Community Key Value store
        createKeyValueTable();
    }

    function createMemberTable() public {
        if (memberTable.id != 0) {
            revert ErrorTableExists(memberTable.name);
        }

        string memory memberPrefix = string.concat(tablePrefix, "_member");

        memberTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("id INTEGER PRIMARY KEY, account TEXT", memberPrefix)
        );

        memberTable.name = SQLHelpers.toNameFromId(memberPrefix, memberTable.id);
    }

    function createKeyValueTable() public {
        if (keyValueTable.id != 0) {
            revert ErrorTableExists(keyValueTable.name);
        }

        string memory keyValuePrefix = string.concat(tablePrefix, "_key_value");

        keyValueTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("k TEXT PRIMARY KEY, v TEXT", keyValuePrefix)
        );

        keyValueTable.name = SQLHelpers.toNameFromId(keyValuePrefix, keyValueTable.id);
    }

    function insertMember(uint256 _memberId) public {
        // Prepare SQL
        string memory memberIdString = Strings.toString(_memberId);
        // string memory accountString = Strings.toHexString(msg.sender); // TODO: Costly

        string memory sql = string.concat("INSERT INTO ", memberTable.name, " (id) VALUES (", memberIdString, ");");

        // Run Query
        tableland.runSQL(address(this), memberTable.id, sql);
    }

    function setCommunityData(CommunityContractData memory _communityData) public {
        handle = _communityData.handle;
        visibility = _communityData.visibility;
        membership = _communityData.membership;
        apps = _communityData.apps;
    }

    function getCommunityData() public view returns (CommunityContractData memory) {
        return CommunityContractData({ handle: handle, visibility: visibility, membership: membership, apps: apps });
    }

    function getTables() public view returns (Table[] memory) {
        Table[] memory tables = new Table[](2);
        tables[0] = memberTable;
        tables[1] = keyValueTable;

        return tables;
    }

    // Mint is essentially creating a new member
    // Add permissions i.e. should only be possible if the community is open & public
    function join() public {
        if (memberToTokenId[msg.sender] != 0 || getFounder() == msg.sender) {
            revert ErrorMemberExists(msg.sender);
        }

        memberTokenId.increment();
        uint256 newMemberTokenId = memberTokenId.current();

        _mint(msg.sender, newMemberTokenId);
        insertMember(newMemberTokenId);
        memberToTokenId[msg.sender] = newMemberTokenId;
    }

    function setCommunitiesContractAddress(address _address) public {
        communitiesContract = IEmbraceCommunities(_address);
    }

    function getFounder() public view returns (address) {
        return communitiesContract.ownerOf(communityId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseUri;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Upgradeable, AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function totalSupply() public view returns (uint256) {
        return memberTokenId.current();
    }
}
