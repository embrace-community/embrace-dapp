// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Types.sol";
import "hardhat/console.sol";

contract TablelandCommunities {
    error ErrorHandleExists(string handle);
    error ErrorTableExists(string tableName);

    struct Table {
        uint256 id;
        string name;
    }

    string private tablePrefix = "embrace_communities";

    ITablelandTables private tableland;

    Table public communitiesTable;

    constructor(address _tablelandRegistryAddress) {
        tableland = ITablelandTables(_tablelandRegistryAddress);

        // Create tableland table
        _createCommunitiesTable();
    }

    function _getTablelandBaseURI() internal view returns (string memory) {
        string memory _tokenQuery = string.concat("SELECT+metadata+FROM+", communitiesTable.name, "+WHERE+id+%3D+");
        return string.concat("https://testnets.tableland.network/query?unwrap=true&extract=true&s=", _tokenQuery);
    }

    function _createCommunitiesTable() private {
        if (communitiesTable.id != 0) {
            revert ErrorTableExists(communitiesTable.name);
        }
        communitiesTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("id integer primary key, metadata text, indexed integer", tablePrefix)
        );
        communitiesTable.name = SQLHelpers.toNameFromId(tablePrefix, communitiesTable.id);

        console.log("Created table: %s", communitiesTable.name);
    }

    function _insertCommunity(uint256 newCommunityId, CommunityMetaData memory _communityMetaData) public {
        // Prepare SQL
        string memory newCommunityIdString = Strings.toString(newCommunityId);
        string memory metadataString = string.concat(
            '{"handle": "',
            _communityMetaData.handle,
            '", "name": "',
            _communityMetaData.name,
            '", "description": "',
            _communityMetaData.description,
            '", "image": "',
            _communityMetaData.image,
            '"}'
        );
        string memory indexedString = Strings.toString(1);

        string memory sql = SQLHelpers.toInsert(
            tablePrefix,
            communitiesTable.id,
            "id, metadata, indexed",
            string.concat(newCommunityIdString, ",", SQLHelpers.quote(metadataString), ",", indexedString)
        );

        if (block.chainid == 31337) {
            console.log("Inserting Community: %s", sql);
            return;
        }

        // Run Query
        tableland.runSQL(address(this), communitiesTable.id, sql);
    }
}
