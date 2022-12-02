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
    }

    App[] public apps;
    mapping(bytes32 => uint256) public nameToIndex;
    // bytes32[] categories;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier uniqueAppName(string memory _appName) {
        require(nameToIndex[keccak256(bytes(_appName))] == 0, "App name already exists.");
        _;
    }

    constructor() {
        owner = msg.sender;

        _appIdCounter.increment(); // So we start at 1
        apps.push();
    }

    function createApp(
        string memory _name,
        address _contractAddress,
        bool _enabled
    ) public onlyOwner uniqueAppName(_name) {
        uint256 id = _appIdCounter.current();
        App memory app = App({ id: id, name: _name, contractAddress: _contractAddress, enabled: _enabled });

        apps.push(app);
        _appIdCounter.increment();

        nameToIndex[keccak256(bytes(_name))] = id;
    }

    function setAppContractAddress(string memory _name, address _contractAddress) public onlyOwner {
        for (uint256 i = 0; i < apps.length; i++) {
            if (keccak256(bytes(apps[i].name)) == keccak256(bytes(_name))) {
                apps[i].contractAddress = _contractAddress;
            }
        }
    }

    function getApps() public view returns (App[] memory) {
        return apps;
    }

    function getAppById(uint128 _appId) public view returns (App memory) {
        for (uint256 i = 0; i < apps.length; i++) {
            if (apps[i].id == _appId) {
                return apps[i];
            }
        }

        revert("App not found.");
    }

    function getAppByName(string memory _name) public view returns (App memory) {
        uint256 index = nameToIndex[keccak256(bytes(_name))];

        if (index == 0) {
            revert("App not found.");
        }

        return apps[index];
    }
}
