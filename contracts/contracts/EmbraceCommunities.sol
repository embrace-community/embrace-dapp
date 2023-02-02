// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "./Types.sol";
import "./TablelandCommunities.sol";

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
contract EmbraceCommunities is ERC721URIStorage, ERC721Holder, TablelandCommunities {
    using Counters for Counters.Counter;
    Counters.Counter private communityId;
    Counters.Counter private burnCount; // Number of times a NFT has been burned / community closed

    error ErrorNotCommunityOwner(uint256 communityId, address account);

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
    address immutable tablelandRegistryAddress;

    modifier onlyFounder(uint256 _communityId) {
        if (ownerOf(_communityId) != msg.sender) {
            revert ErrorNotCommunityOwner(_communityId, msg.sender);
        }
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        address _accountsContractAddress,
        address _embraceCommunityAddress,
        address _tablelandRegistryAddress
    ) ERC721(_name, _symbol) TablelandCommunities(_tablelandRegistryAddress) {
        tablelandRegistryAddress = _tablelandRegistryAddress;

        embraceCommunityAddress = _embraceCommunityAddress;
        accountsContract = IEmbraceAccounts(_accountsContractAddress);

        // TODO: Consider using ERC721Metadata format
        _setBaseURI(_getTablelandBaseURI());
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

        // Stage 1 - save community in this contract
        // a) Mint NFT for community
        _mint(msg.sender, newCommunityId);

        // Currently uses TableLand - could just be an Event for the Graph - new CommunityCreated event with metadata CID
        _insertCommunity(newCommunityId, _communityMetaData);

        console.log("Community Created: %s %s", newCommunityId, block.chainid);

        return newCommunityId;
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

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getCommunities() public view returns (Community[] memory) {
        return communities;
    }

    function getTableName() public view returns (string memory) {
        return communitiesTable.name;
    }

    function totalSupply() public view returns (uint256) {
        return communityId.current();
    }

    function totalCommunities() public view returns (uint256) {
        return communityId.current() - burnCount.current();
    }

    function close(uint256 _communityId) public onlyFounder(_communityId) {
        _burn(_communityId);
        burnCount.increment();
    }

    function onERC721Received(address, address, uint256, bytes memory) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _baseURI() internal view virtual override(ERC721) returns (string memory) {
        return baseUri;
    }
}
