// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

// import "hardhat/console.sol";

contract EmbraceApps {
    struct App {
        bytes32 code;
        address contractAddress;
        bool enabled;
    }

    uint256 private appIndex = 1;
    App[] public apps;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier uniqueAppCode(bytes32 _appCode) {
        for (uint256 i = 0; i < apps.length; i++) {
            require(apps[i].code != _appCode, "App code already exists.");
        }
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createApp(
        bytes32 _code,
        address _contractAddress,
        bool _enabled
    ) public onlyOwner uniqueAppCode(_code) {
        App memory app = App({ code: _code, contractAddress: _contractAddress, enabled: _enabled });

        apps.push(app);
        appIndex++;
    }

    function setAppContractAddress(bytes32 _code, address _contractAddress) public onlyOwner {
        for (uint256 i = 0; i < apps.length; i++) {
            if (apps[i].code == _code) {
                apps[i].contractAddress = _contractAddress;
            }
        }
    }

    function getApps() public view returns (App[] memory) {
        return apps;
    }

    function getAppByIndex(uint256 _appIndex) public view returns (App memory) {
        return apps[_appIndex];
    }

    function getAppByCode(bytes32 _code) public view returns (App memory) {
        for (uint256 i = 0; i < apps.length; i++) {
            if (apps[i].code == _code) {
                return apps[i];
            }
        }

        revert("No app found");
    }
}
