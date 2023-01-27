// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./EmbraceCommunities.sol";
import "./Types.sol";

contract EmbraceCommunity is ERC721Enumerable, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _memberTokenId;

    string private baseUri;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address member;
    }

    EmbraceCommunities embraceCommunitiesContract;

    uint256 public communityId;
    string public handle;
    Visibility public visibility;
    Membership public membership;
    uint128[] public apps;

    constructor(
        string memory _name,
        string memory _symbol,
        address _embraceCommunitiesContract,
        uint256 _communityId
    ) ERC721(_name, _symbol) {
        _setBaseURI("ipfs://");
        embraceCommunitiesContract = EmbraceCommunities(_embraceCommunitiesContract);
        communityId = _communityId;

        _memberTokenId.increment(); // First memberTokenId is 1
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

    // Mint is essentially creating a new member
    function mint() public {
        uint256 newMemberTokenId = _memberTokenId.current();

        _mint(msg.sender, newMemberTokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getAllMembers() public view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](totalSupply());
        for (uint256 i = 0; i < totalSupply(); i++) {
            tokens[i] = tokenByIndex(i);
        }
        return tokens;
    }

    function getAllMembersData() public view returns (TokenData[] memory) {
        TokenData[] memory tokenData = new TokenData[](totalSupply());
        for (uint256 i = 0; i < totalSupply(); i++) {
            tokenData[i] = TokenData({
                tokenId: tokenByIndex(i),
                tokenURI: tokenURI(tokenByIndex(i)),
                member: ownerOf(tokenByIndex(i))
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
    ) public view virtual override(AccessControl, ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
