// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./EmbraceAccounts.sol";
import "./EmbraceApps.sol";
import "./EmbraceCommunity.sol";
import "./Types.sol";

// Stores all the communities created with the reference to the ERC721 Community contract
contract EmbraceCommunities is ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _communityId;

    string private baseUri;

    mapping(bytes32 => uint256) public handleToId;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address owner;
    }

    struct Community {
        uint256 id;
        address contractAddress;
        string handle;
    }

    // Currently saved to IPFS but will be saved to Tableland
    struct CommunityMetaData {
        string name;
        string description;
        string image;
    }

    Community[] public communities;

    EmbraceAccounts accountsContract;
    EmbraceApps appsContract;

    constructor(
        string memory _name,
        string memory _symbol,
        address _accountsContractAddress,
        address _appsContractAddress
    ) ERC721(_name, _symbol) {
        _setBaseURI("ipfs://");
        accountsContract = EmbraceAccounts(_accountsContractAddress);
        appsContract = EmbraceApps(_appsContractAddress);

        _communityId.increment(); // First communityId is 1
    }

    function createCommunity(
        string memory _handle,
        CommunityData memory _communityData,
        string memory _tokenURI, // Metadata - IPFS - will change to Tableland later so we need the values of metadata (img, name, desc)
        CommunityMetaData memory _communityMetaData
    ) public returns (uint256) {
        bytes32 _handleBytes = keccak256(bytes(_handle));
        if (handleToId[_handleBytes] != 0) {
            //revert ErrorHandleExists(_handle);
            revert("Handle exists");
        }

        uint256 newCommunityId = _communityId.current();

        _mint(msg.sender, newCommunityId);

        if (bytes(_tokenURI).length > 0) {
            super._setTokenURI(newCommunityId, _tokenURI);
        }

        // Create new ERC721 Community contract
        EmbraceCommunity newCommunity = new EmbraceCommunity(
            address(this),
            newCommunityId,
            "EMB_COMM_NFT_NAME", // TODO: Change to community name / let UI determine this?
            "EMB_COMM_NFT_SYMBOL"
        );

        newCommunity.setCommunityData(_communityData);

        Community memory community = Community({
            id: newCommunityId,
            contractAddress: address(newCommunity),
            handle: _handle
        });

        communities.push(community);

        handleToId[_handleBytes] = newCommunityId;

        // SAVE COMMUNITY DATA TO TABLELAND
        // CommunityId, Name, Handle, Image, Founder

        // Add space to founder's account
        accountsContract.addSpace(msg.sender, newCommunityId);

        // emit SpaceCreated(spaceId, msg.sender);

        console.log("Community Created: %s", newCommunityId);

        _communityId.increment(); // For next communityId

        return newCommunityId;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Method may not be needed
    // gets all the community NFTs i.e. all the communities
    function getAllTokens() public view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](totalSupply());
        for (uint256 i = 0; i < totalSupply(); i++) {
            tokens[i] = tokenByIndex(i);
        }
        return tokens;
    }

    // Method may not be needed
    // gets all the community NFTs i.e. all the communities with more data
    function getAllTokensData() public view returns (TokenData[] memory) {
        TokenData[] memory tokenData = new TokenData[](totalSupply());
        for (uint256 i = 0; i < totalSupply(); i++) {
            tokenData[i] = TokenData({
                tokenId: tokenByIndex(i),
                tokenURI: tokenURI(tokenByIndex(i)),
                owner: ownerOf(tokenByIndex(i))
            });
        }
        return tokenData;
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
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
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
