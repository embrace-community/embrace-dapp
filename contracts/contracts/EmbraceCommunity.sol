// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
import "./EmbraceCommunities.sol";
import "./CommunityTableMethods.sol";
import "./Types.sol";

// TODO Setup AccessControls - Admin role, Default Admin role assigned to Founder
contract EmbraceCommunity is ERC721URIStorage /*AccessControl,*/, CommunityTableMethods {
    using Counters for Counters.Counter;
    Counters.Counter private _memberTokenId;

    string private baseUri;

    struct TokenData {
        uint256 tokenId;
        string tokenURI;
        address member;
    }

    EmbraceCommunities embraceCommunitiesContract;

    uint256 private communityId;
    string private handle;
    Visibility private visibility;
    Membership private membership;
    uint128[] private apps;

    constructor(
        string memory _name,
        string memory _symbol,
        address _embraceCommunitiesContract,
        address _tablelandRegistryAddress,
        uint256 _communityId
    ) ERC721(_name, _symbol) CommunityTableMethods(_tablelandRegistryAddress) {
        embraceCommunitiesContract = EmbraceCommunities(_embraceCommunitiesContract);
        communityId = _communityId;

        setPrefix(string.concat("embrace_community_", Strings.toString(communityId)));

        _memberTokenId.increment(); // First memberTokenId is 1

        // Create the community member table
        createMemberTable();

        // Set Member NFT token URI
        // TODO: Consider using ERC721Metadata format
        string memory _tokenQuery = string.concat("SELECT+id%2C+createdDate+FROM+", memberTable.name, "+WHERE+id+%3D+");

        _setBaseURI(string.concat("https://testnets.tableland.network/query?unwrap=true&s=", _tokenQuery));

        // Create Community Key Value store
        createKeyValueTable();
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

    function getTables() public view returns (Table[] memory) {
        Table[] memory tables = new Table[](2);
        tables[0] = memberTable;
        tables[1] = keyValueTable;

        return tables;
    }

    // Mint is essentially creating a new member
    // Add permissions i.e. should only be possible if the community is open & public
    function join() public {
        uint256 newMemberTokenId = _memberTokenId.current();

        _mint(msg.sender, newMemberTokenId);

        insertMember(newMemberTokenId);

        _memberTokenId.increment();
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _setBaseURI(string memory _uri) internal {
        baseUri = _uri;
    }

    function _baseURI() internal view virtual override(ERC721) returns (string memory) {
        return baseUri;
    }
}
