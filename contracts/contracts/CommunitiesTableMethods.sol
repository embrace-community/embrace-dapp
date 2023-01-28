// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "./Types.sol";

contract CommunitiesTableMethods {
    error ErrorTableExists(string tableName);

    struct Table {
        uint256 id;
        string name;
    }

    string private tablePrefix;

    ITablelandTables private tableland;

    Table public communitiesTable;

    constructor(address _tablelandRegistryAddress, string memory _tablePrefix) {
        tableland = ITablelandTables(_tablelandRegistryAddress);
        tablePrefix = _tablePrefix;
    }

    function createCommunitiesTable() public {
        if (communitiesTable.id != 0) {
            revert ErrorTableExists(communitiesTable.name);
        }
        communitiesTable.id = tableland.createTable(
            address(this),
            // 0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC,
            SQLHelpers.toCreateFromSchema("id integer primary key, metadata text, indexed integer", tablePrefix)
        );
        communitiesTable.name = SQLHelpers.toNameFromId(tablePrefix, communitiesTable.id);
    }

    function insertCommunity(uint256 newCommunityId, CommunityMetaData memory _communityMetaData) public {
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

        string memory sql = string.concat(
            "INSERT INTO ",
            communitiesTable.name,
            " (id, metadata, indexed) VALUES (",
            newCommunityIdString,
            ",'",
            metadataString,
            "',",
            indexedString,
            ");"
        );

        // Run Query
        tableland.runSQL(address(this), communitiesTable.id, sql);
    }
}
