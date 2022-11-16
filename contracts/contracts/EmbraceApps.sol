// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";

contract EmbraceApps {
    using Counters for Counters.Counter;

    Counters.Counter private _appIdCounter;

    struct App {
        uint256 id;
        bytes32 code;
        address contractAddress;
        bool enabled;
        string metadata;
    }

    App[] public apps;
    bytes32[] categories;

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
        string memory _metadata,
        bool _enabled
    ) public onlyOwner uniqueAppCode(_code) {
        App memory app = App({
            id: _appIdCounter.current(),
            code: _code,
            contractAddress: _contractAddress,
            metadata: _metadata,
            enabled: _enabled
        });

        apps.push(app);

        _appIdCounter.increment();
    }

    function setAppContractAddress(bytes32 _code, address _contractAddress) public onlyOwner {
        for (uint256 i = 0; i < apps.length; i++) {
            if (apps[i].code == _code) {
                apps[i].contractAddress = _contractAddress;
            }
        }
    }

    function updateMetadata(uint256 _appId, string memory _newMetadata) public onlyOwner returns (App memory) {
        App storage app = apps[_appId];
        app.metadata = _newMetadata;

        return app;
    }

    function getApps() public view returns (App[] memory) {
        return apps;
    }

    function getAppByIndex(uint256 _appId) public view returns (App memory) {
        return apps[_appId];
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
