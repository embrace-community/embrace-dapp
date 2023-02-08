// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";
import "./Interfaces.sol";

error ErrorHandleExists(string handle);
error ErrorNotCommunityOwner(uint256 communityId, address account);

// Stores all the communities created with the reference to the ERC721 Community contract
contract EmbraceCommunities is ERC721URIStorage, ERC721Holder {
    using Counters for Counters.Counter;
    Counters.Counter private communityId;
    Counters.Counter private burnCount; // Number of times a NFT has been burned / community closed

    event CommunityCreated(uint256 communityId, Visibility visibility, Access access, string communityMetaData);

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
        address _embraceCommunityAddress
    ) ERC721(_name, _symbol) {
        embraceCommunityAddress = _embraceCommunityAddress;
        accountsContract = IEmbraceAccounts(_accountsContractAddress);

        _setBaseURI("ipfs://");
    }

    function createCommunity(string calldata _handle, CommunityData memory _communityData) public returns (uint256) {
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
            newCommunityId,
            _communityData
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

        // So that CID is appended to the baseURI
        _setTokenURI(newCommunityId, _communityData.metadata);

        // Event for The Graph
        emit CommunityCreated(
            newCommunityId,
            _communityData.visibility, // Listed / Unlisted
            _communityData.access, // Open, Closed, Gated
            _communityData.metadata // IPFS CID
        );

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

    function updateCommunity(
        uint256 _communityId,
        CommunityData memory _CommunityData
    ) public onlyFounder(_communityId) {
        Community memory community = communities[_communityId - 1];

        IEmbraceCommunity(community.contractAddress).setCommunityData(_CommunityData);

        _setTokenURI(_communityId, _CommunityData.metadata);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getCommunities() public view returns (Community[] memory) {
        return communities;
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
