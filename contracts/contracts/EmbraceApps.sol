// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";

contract EmbraceApps {
    using Counters for Counters.Counter;

    Counters.Counter private _appIdCounter;

    struct App {
        uint256 id;
        string name;
        address contractAddress;
        bool enabled;
        // string metadata;
    }

    App[] public apps;
    mapping(bytes32 => uint256) public nameToId;
    // bytes32[] categories;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier uniqueAppName(string memory _appName) {
        require(nameToId[keccak256(bytes(_appName))] == 0, "App name already exists.");
        _;
    }

    constructor() {
        owner = msg.sender;

        _appIdCounter.increment(); // So we start at 1
    }

    function createApp(
        string memory _name,
        address _contractAddress,
        // string memory _metadata,
        bool _enabled
    ) public onlyOwner uniqueAppName(_name) {
        uint256 id = _appIdCounter.current();
        App memory app = App({
            id: id,
            name: _name,
            contractAddress: _contractAddress,
            // metadata: _metadata,
            enabled: _enabled
        });

        apps.push(app);
        _appIdCounter.increment();

        nameToId[keccak256(bytes(_name))] = id;
    }

    function setAppContractAddress(uint128 _appId, address _contractAddress) public onlyOwner {
        require(_appId == 0, "App does not exist.");

        apps[_appId - 1].contractAddress = _contractAddress;
    }

    function getApps() public view returns (App[] memory) {
        return apps;
    }

    // function getAppByIndex(uint256 _appIndex) public view returns (App memory) {
    //     return apps[_appIndex];
    // }

    function getAppById(uint128 _appId) public view returns (App memory) {
        // The appId, will always be the index + 1
        if (_appId > 0) {
            return apps[_appId - 1];
        }

        revert("App not found.");
    }

    function getAppByName(string memory _name) public view returns (App memory) {
        uint256 _appId = nameToId[keccak256(bytes(_name))];
        if (_appId > 0) {
            return apps[_appId - 1];
        }
        revert("App not found.");
    }

    // function updateMetadata(uint256 _appId, string memory _newMetadata) public onlyOwner returns (App memory) {
    //     App storage app = apps[_appId - 1];
    //     app.metadata = _newMetadata;

    //     return app;
    // }
}
