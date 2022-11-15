// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

// FOR FUTURE DATE: THIS CONTRACT WOULD NEED TO BE DEPLOYED FOR EACH SPACE
// IT WOULD STORE ONLY THE MEMBERS OF THAT SPACE AND THE CONTRACT ADDRESS WOULD BE STORED IN THE SPACE CONTRACT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract EmbraceSpaceMembersNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _memberIds;

    uint256 private spaceId;

    struct Member {
        bool isAdmin;
        bool isActive;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _spaceId
    ) ERC721(_name, _symbol) {
        spaceId = _spaceId;
    }

    function join(address _member, string memory _memberURI) public returns (uint256) {
        _memberIds.increment();

        uint256 newMemberId = _memberIds.current();
        _mint(_member, newMemberId);
        _setTokenURI(newMemberId, _memberURI);

        return newMemberId;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
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
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
