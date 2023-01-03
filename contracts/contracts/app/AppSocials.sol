// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import { IEmbraceSpaces } from "../Interfaces.sol";
import "hardhat/console.sol";

contract AppSocials is IEmbraceSpaces {
    struct Social {
        uint256 id;
        address lensWallet;
        string lensDefaultProfileId;
    }

    mapping(uint256 => Social) public spaceSocials;

    error ErrorOnlyAdmin(uint256 spaceId, address memberAddress);

    event SocialCreated(
        uint256 indexed spaceId,
        address indexed creator,
        address lensWallet,
        string indexed lensDefaultProfileId
    );

    address public embraceSpacesAddress;

    constructor(address _embraceSpacesAddress) {
        embraceSpacesAddress = _embraceSpacesAddress;
    }

    modifier onlySpaceAdmin(uint256 _spaceId) {
        if (!isAdminExternal(_spaceId, msg.sender) && !isFounderExternal(_spaceId, msg.sender))
            revert ErrorOnlyAdmin(_spaceId, msg.sender);
        _;
    }

    function isAdminExternal(uint256 _spaceId, address _address) public view returns (bool) {
        return IEmbraceSpaces(embraceSpacesAddress).isAdminExternal(_spaceId, _address);
    }

    function isFounderExternal(uint256 _spaceId, address _address) public view returns (bool) {
        return IEmbraceSpaces(embraceSpacesAddress).isFounderExternal(_spaceId, _address);
    }

    // Only space admins can create a collection for the space
    function createSocial(
        uint256 _spaceId,
        address _lensWallet,
        string memory _lensDefaultProfileId
    ) public onlySpaceAdmin(_spaceId) {
        // Create new ERC721 collection contract
        Social memory social = Social(_spaceId, _lensWallet, _lensDefaultProfileId);

        spaceSocials[_spaceId] = social;

        // Event for social creation
        emit SocialCreated(_spaceId, msg.sender, _lensWallet, _lensDefaultProfileId);
    }

    function getSocial(uint256 _spaceId) public view returns (Social memory) {
        return spaceSocials[_spaceId];
    }
}
