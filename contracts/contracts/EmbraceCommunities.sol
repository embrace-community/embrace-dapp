// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "./CommunitiesTableMethods.sol";
import "./EmbraceAccounts.sol"; // TODO Swap with Interface
import "./EmbraceCommunity.sol";

// Stores all the communities created with the reference to the ERC721 Community contract
contract EmbraceCommunities is ERC721URIStorage, ERC721Holder /*Ownable,*/, CommunitiesTableMethods {
    using Counters for Counters.Counter;
    Counters.Counter private communityId;

    error ErrorHandleExists(string handle);

    address private tablelandRegistryAddress;

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

    Community[] private communities;

    EmbraceAccounts accountsContract;

    constructor(
        string memory _name,
        string memory _symbol,
        address _accountsContractAddress,
        address _tablelandRegistryAddress // Localhost: 0x5fbdb2315678afecb367f032d93f642f64180aa3 / Mumbai: 0x4b48841d4b32C4650E4ABc117A03FE8B51f38F68
    ) ERC721(_name, _symbol) CommunitiesTableMethods(_tablelandRegistryAddress, "embrace_communities") {
        tablelandRegistryAddress = _tablelandRegistryAddress;

        // Create tableland table
        createCommunitiesTable();

        // TODO: Consider using ERC721Metadata format
        string memory _tokenQuery = string.concat("SELECT+metadata+FROM+", communitiesTable.name, "+WHERE+id+%3D+");

        _setBaseURI(string.concat("https://testnets.tableland.network/query?unwrap=true&extract=true&s=", _tokenQuery));

        accountsContract = EmbraceAccounts(_accountsContractAddress);

        communityId.increment(); // First communityId is 1
    }

    function getTableName() public view returns (string memory) {
        return communitiesTable.name;
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
            revert ErrorHandleExists(_handle);
        }

        uint256 newCommunityId = communityId.current();

        // Stage 1 - save community in this contract
        // a) Mint NFT for community
        _mint(msg.sender, newCommunityId);

        // b) Save community data to global communities table in Tableland
        insertCommunity(newCommunityId, _communityMetaData);

        // Stage 2 - deploy new ERC721 Community contract specific to this community
        EmbraceCommunity newCommunity = new EmbraceCommunity(
            "EMB_COMM_NFT_NAME", // TODO: Change to community name / let UI determine this?
            "EMB_COMM_NFT_SYMBOL",
            address(this),
            tablelandRegistryAddress,
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

        // Add space to founder's account
        // accountsContract.addSpace(msg.sender, newCommunityId);

        // emit SpaceCreated(spaceId, msg.sender);

        console.log("Community Created: %s", newCommunityId);

        communityId.increment(); // For next communityId

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
}
