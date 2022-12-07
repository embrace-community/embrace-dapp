// SPDX-License-Identifier: MIT

pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./app/AppCreations.sol";
import "hardhat/console.sol";

contract EmbraceApps {
    using Counters for Counters.Counter;

    Counters.Counter private _appIdCounter;

    enum AppIds {
        CHAT_SERVER,
        SOCIAL,
        CREATIONS
    }

    // App struct for all apps - added by Embrace
    struct App {
        uint256 id;
        string name;
        address contractAddress;
        bool enabled;
        // string metadata;
    }

    // The App data specific to each space
    struct SpaceApp {
        uint256 appId; // The appId from App struct
        string name; // if null then will fallback to name in App struct
        address contractAddress; // if null will fallback to contractAddress in App struct
        string metadata; // could be used to store any metadata for the spaces app e.g. Lens info / YouTube API key (unless using Ceramic)
    }

    App[] public apps;
    mapping(bytes32 => uint256) public nameToId;

    // This will store the appIds for each space
    mapping(uint256 => uint256[]) public spaceToAppIds; // Not currently used on UI
    // This will enable us to get the SpaceApp data for each space i.e. spaceId -> appId -> SpaceApp (settings / name etc)
    mapping(uint256 => mapping(uint256 => SpaceApp)) public spaceToAppIdToSpaceApp; // Not currently used on UI
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
        require(_appId > 0, "App does not exist.");

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

    // Could take extra params to set the name / metadata etc
    // TODO: Should receive the appId and not the index
    function addAppToSpace(uint256 _spaceId, uint128 _appIndex) public {
        //require(apps[_appIndex].id > 0, "App does not exist.");

        console.log("addAppToSpace", _spaceId, _appIndex);

        // TODO: Check if the app is already added to the space?

        App memory app = apps[_appIndex];

        // Add the appId to the space
        spaceToAppIds[_spaceId].push(app.id);

        // Add the SpaceApp data
        SpaceApp memory spaceApp = SpaceApp({
            appId: app.id,
            name: app.name,
            contractAddress: app.contractAddress,
            metadata: ""
        });

        spaceToAppIdToSpaceApp[_spaceId][app.id] = spaceApp;
    }

    // function updateMetadata(uint256 _appId, string memory _newMetadata) public onlyOwner returns (App memory) {
    //     App storage app = apps[_appId - 1];
    //     app.metadata = _newMetadata;

    //     return app;
    // }
}
