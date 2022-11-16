// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";

contract EmbraceApps {
    using Counters for Counters.Counter;

    Counters.Counter private _appIdCounter;

    struct App {
        uint256 id;
        string code;
        address contractAddress;
        bool enabled;
        string metadata;
    }

    App[] public apps;
    mapping(bytes32 => uint256) public codeToIndex;
    bytes32[] categories;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier uniqueAppCode(string memory _appCode) {
        for (uint256 i = 0; i < apps.length; i++) {
            require(keccak256(bytes(apps[i].code)) != keccak256(bytes(_appCode)), "App code already exists.");
        }
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createApp(
        string memory _code,
        address _contractAddress,
        string memory _metadata,
        bool _enabled
    ) public onlyOwner uniqueAppCode(_code) {
        uint256 id = _appIdCounter.current();
        App memory app = App({
            id: id,
            code: _code,
            contractAddress: _contractAddress,
            metadata: _metadata,
            enabled: _enabled
        });

        apps.push(app);
        codeToIndex[keccak256(bytes(_code))] = id;

        _appIdCounter.increment();
    }

    function setAppContractAddress(string memory _code, address _contractAddress) public onlyOwner {
        for (uint256 i = 0; i < apps.length; i++) {
            if (keccak256(bytes(apps[i].code)) == keccak256(bytes(_code))) {
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

    function getAppByCode(string memory _code) public view returns (App memory) {
        codeToIndex[keccak256(bytes(_code))];

        revert("No app found");
    }
}
