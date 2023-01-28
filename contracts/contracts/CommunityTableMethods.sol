// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";

contract CommunityTableMethods {
    error ErrorTableExists(string tableName);

    struct Table {
        uint256 id;
        string name;
    }

    string private tablePrefix;

    ITablelandTables private tableland;

    Table public memberTable;
    Table public keyValueTable;

    constructor(address _tablelandRegistryAddress) {
        tableland = ITablelandTables(_tablelandRegistryAddress);
    }

    function setPrefix(string memory _tablePrefix) public {
        tablePrefix = _tablePrefix;
    }

    function createMemberTable() public {
        if (memberTable.id != 0) {
            revert ErrorTableExists(memberTable.name);
        }

        string memory memberPrefix = string.concat(tablePrefix, "_member");

        memberTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("id INTEGER PRIMARY KEY, createdDate INTEGER", memberPrefix)
        );

        memberTable.name = SQLHelpers.toNameFromId(memberPrefix, memberTable.id);
    }

    function createKeyValueTable() public {
        if (keyValueTable.id != 0) {
            revert ErrorTableExists(keyValueTable.name);
        }

        string memory keyValuePrefix = string.concat(tablePrefix, "_key_value");

        keyValueTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("k TEXT PRIMARY KEY, v TEXT", keyValuePrefix)
        );

        keyValueTable.name = SQLHelpers.toNameFromId(keyValuePrefix, keyValueTable.id);
    }

    function insertMember(uint256 _memberId) public {
        // Prepare SQL
        string memory memberIdString = Strings.toString(_memberId);
        string memory createdDateString = Strings.toString(block.timestamp);

        string memory sql = string.concat(
            "INSERT INTO ",
            memberTable.name,
            " (id, createdDate) VALUES (",
            memberIdString,
            "',",
            createdDateString,
            ");"
        );

        // Run Query
        tableland.runSQL(address(this), memberTable.id, sql);
    }
}
