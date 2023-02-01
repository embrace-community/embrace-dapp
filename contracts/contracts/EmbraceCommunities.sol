// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "hardhat/console.sol";
import "./Types.sol";

interface IEmbraceCommunity {
    function initialize(
        string memory _name,
        string memory _symbol,
        address _founderAddress,
        address _communitiesContractAddress,
        address _tablelandRegistryAddress,
        uint256 _communityId,
        CommunityContractData memory _communityData
    ) external;

    function setCommunityData(CommunityContractData memory _communityData) external;

    function setCommunitiesContractAddress(address _communitiesContractAddress) external;
}

interface IEmbraceAccounts {
    function addSpace(address _account, uint256 _spaceId) external;
}

// Stores all the communities created with the reference to the ERC721 Community contract
contract EmbraceCommunities is ERC721URIStorage, ERC721Holder, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private communityId;

    error ErrorHandleExists(string handle);
    error ErrorTableExists(string tableName);

    struct Table {
        uint256 id;
        string name;
    }

    string private tablePrefix = "embrace_communities";

    ITablelandTables private tableland;

    Table public communitiesTable;

    address immutable tablelandRegistryAddress;
    address immutable embraceCommunityAddress;

    string private baseUri;

    mapping(bytes32 => uint256) public handleToId;

    struct Community {
        uint256 id;
        address contractAddress;
        string handle;
    }

    Community[] private communities;

    IEmbraceAccounts immutable accountsContract;

    constructor(
        string memory _name,
        string memory _symbol,
        address _accountsContractAddress,
        address _embraceCommunityAddress,
        address _tablelandRegistryAddress // Localhost: 0x5fbdb2315678afecb367f032d93f642f64180aa3 / Mumbai: 0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68
    ) ERC721(_name, _symbol) {
        tablelandRegistryAddress = _tablelandRegistryAddress;
        embraceCommunityAddress = _embraceCommunityAddress;

        tableland = ITablelandTables(_tablelandRegistryAddress);
        accountsContract = IEmbraceAccounts(_accountsContractAddress);

        // Create tableland table
        createCommunitiesTable();

        // TODO: Consider using ERC721Metadata format
        string memory _tokenQuery = string.concat("SELECT+metadata+FROM+", communitiesTable.name, "+WHERE+id+%3D+");

        _setBaseURI(string.concat("https://testnets.tableland.network/query?unwrap=true&extract=true&s=", _tokenQuery));
    }

    function getTableName() public view returns (string memory) {
        return communitiesTable.name;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function createCommunity(
        string memory _handle,
        CommunityContractData memory _communityContractData,
        CommunityMetaData memory _communityMetaData
    ) public returns (uint256) {
        bytes32 _handleBytes = keccak256(bytes(_handle));
        if (handleToId[_handleBytes] != 0) {
            revert ErrorHandleExists(_handle);
        }

        communityId.increment();

        uint256 newCommunityId = communityId.current();

        // Stage 1 - save community in this contract
        // a) Mint NFT for community
        _mint(msg.sender, newCommunityId);

        // b) Save community data to global communities table in Tableland
        insertCommunity(newCommunityId, _communityMetaData);

        // Stage 2 - clone ERC721 Community contract specific to this community - cheaper than deploying new contract
        address embraceCommunityClone = Clones.clone(embraceCommunityAddress);
        IEmbraceCommunity(embraceCommunityClone).initialize(
            string.concat("EMBRACE_COMM_0.13 ", Strings.toString(newCommunityId)), // TODO: Change to community name / let UI determine this?
            string.concat("EMB_COMM_0.13 ", Strings.toString(newCommunityId)),
            msg.sender,
            address(this),
            tablelandRegistryAddress,
            newCommunityId,
            _communityContractData
        );

        Community memory community = Community({
            id: newCommunityId,
            contractAddress: embraceCommunityClone,
            // contractAddress: address(0),
            handle: _handle
        });

        communities.push(community);

        handleToId[_handleBytes] = newCommunityId;

        // Add space to founder's account
        accountsContract.addSpace(msg.sender, newCommunityId);

        // emit SpaceCreated(spaceId, msg.sender);

        console.log("Community Created: %s %s", newCommunityId, block.chainid);

        return newCommunityId;
    }

    function createCommunitiesTable() private {
        if (communitiesTable.id != 0) {
            revert ErrorTableExists(communitiesTable.name);
        }
        communitiesTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("id integer primary key, metadata text, indexed integer", tablePrefix)
        );
        communitiesTable.name = SQLHelpers.toNameFromId(tablePrefix, communitiesTable.id);

        console.log("Created table: %s", communitiesTable.name);
    }

    function insertCommunity(uint256 newCommunityId, CommunityMetaData memory _communityMetaData) public {
        // Prepare SQL
        string memory newCommunityIdString = Strings.toString(newCommunityId);
        string memory metadataString = string.concat(
            '{"handle": "',
            _communityMetaData.handle,
            '", "name": "',
            _communityMetaData.name,
            '", "description": "',
            _communityMetaData.description,
            '", "image": "',
            _communityMetaData.image,
            '"}'
        );
        string memory indexedString = Strings.toString(1);

        string memory sql = SQLHelpers.toInsert(
            tablePrefix,
            communitiesTable.id,
            "id, metadata, indexed",
            string.concat(newCommunityIdString, ",", SQLHelpers.quote(metadataString), ",", indexedString)
        );

        if (block.chainid == 31337) {
            console.log("Inserting Community: %s", sql);
            return;
        }

        // Run Query
        tableland.runSQL(address(this), communitiesTable.id, sql);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Process From UI: 1. Get community contract address from community handle
    // 2. Get community metadata from tableland table by community Id (communitiesTableName) NFT within this global communities contract
    // 3. Get community contract data from specific community contract (EmbraceCommunity(_communityContractAddress).getCommunityData())
    function handleToCommunity(string memory _handle) public view returns (Community memory _community) {
        bytes32 _handleBytes = keccak256(bytes(_handle));
        uint256 _communityId = handleToId[_handleBytes];
        Community memory community = communities[_communityId - 1];

        if (community.id == 0) {
            revert("Community not found");
        }

        return community;
    }

    function getCommunities() public view returns (Community[] memory) {
        return communities;
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _baseURI() internal view virtual override(ERC721) returns (string memory) {
        return baseUri;
    }

    function totalSupply() public view returns (uint256) {
        return communityId.current();
    }
}
