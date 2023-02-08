// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "./Types.sol";

interface IEmbraceSpaces {
    function isAdminExternal(uint256 _spaceId, address _address) external view returns (bool);

    function isFounderExternal(uint256 _spaceId, address _address) external view returns (bool);
}

interface IEmbraceCommunities {
    function ownerOf(uint256 _tokenId) external view returns (address);
}

interface IEmbraceCommunity {
    function initialize(
        string memory _name,
        string memory _symbol,
        address _founderAddress,
        address _communitiesContractAddress,
        uint256 _communityId,
        CommunityData memory _communityData
    ) external;

    function setCommunityData(CommunityData memory _communityData) external;

    function setCommunitiesContractAddress(address _communitiesContractAddress) external;
}

interface IEmbraceAccounts {
    function addSpace(address _account, uint256 _spaceId) external;
}
