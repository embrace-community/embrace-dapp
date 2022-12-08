// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract AppCreationsCollection is ERC721Enumerable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _collectionId;

    uint256 private spaceId;

    string private baseUri;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address owner;
    }

    constructor(uint256 _spaceId, string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        spaceId = _spaceId;
        _setBaseURI("ipfs://");
    }

    // TODO: Need to have access control so that only the founder/admin will be able to mint creations
    // May need to expand to allow Admins of the space to mint creations
    function mint(string memory _tokenURI) public {
        _collectionId.increment();
        uint256 newCollectionId = _collectionId.current();
        _mint(msg.sender, newCollectionId);

        if (bytes(_tokenURI).length > 0) {
            super._setTokenURI(newCollectionId, _tokenURI);
        }
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getAllTokens() public view returns (uint256[] memory) {
        uint256[] memory tokens = new uint256[](totalSupply());
        for (uint256 i = 0; i < totalSupply(); i++) {
            tokens[i] = tokenByIndex(i);
        }
        return tokens;
    }

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
