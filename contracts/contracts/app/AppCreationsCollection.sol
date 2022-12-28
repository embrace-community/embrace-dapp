// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import { IEmbraceSpaces } from "../Interfaces.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract AppCreationsCollection is ERC721Enumerable, ERC721URIStorage, IEmbraceSpaces {
    using Counters for Counters.Counter;
    Counters.Counter private _creationId;

    error ErrorOnlyAdmin(uint256 spaceId, address memberAddress);
    event CreationCreated(
        uint256 indexed spaceId,
        address indexed creator,
        address indexed collectionContractAddress,
        uint256 tokenId
    );

    address public embraceSpacesAddress;

    modifier onlySpaceAdmin(uint256 _spaceId) {
        console.log("onlySpaceAdmin", _spaceId, embraceSpacesAddress);
        if (!isAdminExternal(_spaceId, msg.sender) && !isFounderExternal(_spaceId, msg.sender))
            revert ErrorOnlyAdmin(_spaceId, msg.sender);
        _;
    }

    function isAdminExternal(uint256 _spaceId, address _address) public view returns (bool) {
        console.log("isAdminExternal", _spaceId, embraceSpacesAddress);
        return IEmbraceSpaces(embraceSpacesAddress).isAdminExternal(_spaceId, _address);
    }

    function isFounderExternal(uint256 _spaceId, address _address) public view returns (bool) {
        console.log("isFounderExternal", _spaceId, embraceSpacesAddress);
        return IEmbraceSpaces(embraceSpacesAddress).isFounderExternal(_spaceId, _address);
    }

    uint256 private spaceId;

    string private baseUri;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address owner;
    }

    constructor(
        address _embraceSpacesAddress,
        uint256 _spaceId,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        spaceId = _spaceId;
        embraceSpacesAddress = _embraceSpacesAddress;
        _setBaseURI("ipfs://");
    }

    // Only space admins can create a collection for the space
    function mint(string memory _tokenURI) public onlySpaceAdmin(spaceId) {
        _creationId.increment(); // First creation is 1

        uint256 newCreationId = _creationId.current();

        _mint(msg.sender, newCreationId);

        if (bytes(_tokenURI).length > 0) {
            super._setTokenURI(newCreationId, _tokenURI);
        }

        // Event for when a creation is minted
        emit CreationCreated(spaceId, msg.sender, address(this), newCreationId);
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
        uint256 tokenId, /* firstTokenId */
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
