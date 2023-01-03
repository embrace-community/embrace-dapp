// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

interface IEmbraceSpaces {
    function isAdminExternal(uint256 _spaceId, address _address) external view returns (bool);

    function isFounderExternal(uint256 _spaceId, address _address) external view returns (bool);
}
