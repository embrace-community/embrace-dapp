// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./EmbraceAccounts.sol";
import "./EmbraceCommunity.sol";
import "./Types.sol";

// Stores all the communities created with the reference to the ERC721 Community contract
contract EmbraceCommunities is ERC721URIStorage, ERC721Holder, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _communityId;

    error ErrorTableExists(string tableName);

    // Create a variable that stores the interface to the `TablelandTables` registry contract
    ITablelandTables private _tableland;

    string private baseUri;

    mapping(bytes32 => uint256) public handleToId;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address founder;
        CommunityContractData communityContractData;
    }

    struct Community {
        uint256 id;
        address contractAddress;
        string handle;
    }

    // Currently saved to IPFS but will be saved to Tableland
    struct CommunityMetaData {
        string handle;
        string name;
        string description;
        string image;
    }

    Community[] public communities;
    string public communitiesTableName;
    uint256 public communitiesTableId;
    string public communitiesTablePrefix = "embrace_communities";

    EmbraceAccounts accountsContract;

    constructor(
        string memory _name,
        string memory _symbol,
        address _accountsContractAddress,
        address _tablelandRegistryAddress // Localhost: 0x5fbdb2315678afecb367f032d93f642f64180aa3 / Mumbai: 0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68
    ) ERC721(_name, _symbol) {
        // Pass the `TablelandTables` deployed smart contract address
        _tableland = ITablelandTables(_tablelandRegistryAddress);
        string memory _tokenQuery = string.concat(
            "SELECT+communityId%2C+metadata+FROM+",
            communitiesTableName,
            "+WHERE+communityId+%3D+"
        );

        if (block.chainid == 1137) {
            _setBaseURI(string.concat("http://localhost:8080/query?unwrap=true&extract=true&s=", _tokenQuery));
        } else {
            _setBaseURI(
                string.concat("https://testnets.tableland.network/query?unwrap=true&extract=true&s=", _tokenQuery)
            );
        }

        // Create tableland table
        createCommunitiesTable();

        accountsContract = EmbraceAccounts(_accountsContractAddress);

        _communityId.increment(); // First communityId is 1
    }

    function createCommunitiesTable() public {
        if (communitiesTableId != 0) {
            revert ErrorTableExists(communitiesTableName);
        }

        communitiesTableId = _tableland.createTable(
            address(this),
            // 0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC,
            SQLHelpers.toCreateFromSchema(
                "id integer primary key, metadata text, indexed integer",
                communitiesTablePrefix
            )
        );

        communitiesTableName = SQLHelpers.toNameFromId(communitiesTablePrefix, communitiesTableId);

        // console.log("Created communities table: %s %s", communitiesTableId, communitiesTableName);
    }

    function getTableName() public view returns (string memory) {
        return communitiesTableName;
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function createCommunity(
        string memory _handle,
        CommunityContractData memory _communityData,
        CommunityMetaData memory _communityMetaData
    ) public returns (uint256) {
        bytes32 _handleBytes = keccak256(bytes(_handle));
        if (handleToId[_handleBytes] != 0) {
            //revert ErrorHandleExists(_handle);
            revert("Handle exists");
        }

        uint256 newCommunityId = _communityId.current();

        // Stage 1 - save community in this contract
        // a) Mint NFT for community
        _mint(msg.sender, newCommunityId);

        // b) Save community data to global communities table in Tableland
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

        string memory sql = string.concat(
            "INSERT INTO ",
            communitiesTableName,
            " (id, metadata, indexed) VALUES (",
            newCommunityIdString,
            ",'",
            metadataString,
            "',",
            indexedString,
            ");"
        );

        // Run Query
        _tableland.runSQL(address(this), communitiesTableId, sql);

        // Stage 2 - deploy new ERC721 Community contract specific to this community
        EmbraceCommunity newCommunity = new EmbraceCommunity(
            "EMB_COMM_NFT_NAME", // TODO: Change to community name / let UI determine this?
            "EMB_COMM_NFT_SYMBOL",
            address(this),
            newCommunityId
        );

        // Set community contract data
        newCommunity.setCommunityData(_communityData);

        Community memory community = Community({
            id: newCommunityId,
            contractAddress: address(newCommunity),
            handle: _handle
        });

        communities.push(community);

        handleToId[_handleBytes] = newCommunityId;

        // Save community metadata to Tableland
        // CommunityId, Handle, Name, Description, Image, Founder

        // Add space to founder's account
        accountsContract.addSpace(msg.sender, newCommunityId);

        // emit SpaceCreated(spaceId, msg.sender);

        console.log("Community Created: %s", newCommunityId);

        _communityId.increment(); // For next communityId

        return newCommunityId;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Process From UI: 1. Get community contract address from community handle
    // 2. Get community metadata from tableland table by community Id (communitiesTableName) NFT within this global communities contract
    // 3. Get community contract data from specific community contract (EmbraceCommunity(_communityContractAddress).getCommunityData())
    function handleToCommunity(string memory _handle) public view returns (Community memory _community) {
        bytes32 _handleBytes = keccak256(bytes(_handle));
        uint256 communityId = handleToId[_handleBytes];
        Community memory community = communities[communityId - 1];

        if (community.id == 0) {
            revert("Community not found");
        }

        return community;
    }

    function getCommunities() public view returns (Community[] memory) {
        return communities;
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721URIStorage) {
        super._burn(tokenId);
    }

    function _mint(address to, uint256 tokenId) internal virtual override(ERC721) {
        super._mint(to, tokenId);
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _baseURI() internal view virtual override(ERC721) returns (string memory) {
        return baseUri;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId /* firstTokenId */,
        uint256 batchSize
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
