// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";
import "@tableland/evm/contracts/utils/SQLHelpers.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract TablelandCommunity is Initializable {
    error ErrorTableExists(string tableName);
    error ErrorTableDoesNotExist(string tableName);

    enum TableType {
        MEMBERS,
        KEYVALUE
    }

    struct Table {
        TableType tableType; // Members | Key Value
        uint256 id; // Tableland id
        string name; // Tableland name
        string prefix; // Prefix for this communities version of the table
    }

    mapping(bytes8 => Table) public tables;
    bytes8 internal constant MEMBERS_TABLE = bytes8("MEMBERS");
    bytes8 internal constant KEY_VALUE_TABLE = bytes8("KEYVALUE");

    string internal baseTablePrefix;
    ITablelandTables internal tableland;

    enum KeyValueEncryption {
        None,
        Founder,
        Admin,
        Member,
        Account
    }

    function __TablelandCommunity_init(
        address _tablelandRegistryAddress,
        uint256 communityId
    ) internal onlyInitializing {
        tableland = ITablelandTables(_tablelandRegistryAddress);

        baseTablePrefix = string.concat("embrace_community_", Strings.toString(communityId));

        // Create the community member table
        _createMemberTable();

        // Create Community Key Value store
        _createKeyValueTable();
    }

    function _getTablelandBaseURI() internal view returns (string memory) {
        string memory _tokenQuery = string.concat("SELECT+*+FROM+", tables[MEMBERS_TABLE].name, "+WHERE+id+%3D+");
        return string.concat("https://testnets.tableland.network/query?unwrap=true&s=", _tokenQuery);
    }

    // Tableland Table
    function _createMemberTable() internal {
        Table storage membersTable = tables[MEMBERS_TABLE];

        if (membersTable.id != 0) {
            revert ErrorTableExists(membersTable.name);
        }

        membersTable.tableType = TableType.MEMBERS;
        membersTable.prefix = string.concat(baseTablePrefix, "_members");

        membersTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema("id INTEGER PRIMARY KEY, account TEXT, dateCreated TEXT", membersTable.prefix)
        );

        membersTable.name = SQLHelpers.toNameFromId(membersTable.prefix, membersTable.id);
    }

    // Tableland Table
    function _createKeyValueTable() internal {
        Table storage keyValueTable = tables[KEY_VALUE_TABLE];

        if (keyValueTable.id != 0) {
            revert ErrorTableExists(keyValueTable.name);
        }

        keyValueTable.tableType = TableType.KEYVALUE;
        keyValueTable.prefix = string.concat(baseTablePrefix, "_key_value");

        // TODO: Encryption = 0 = NONE, 1 = FOUNDER, 2 = ADMIN, 3 = MEMBER, 4 = ACCOUNT (that added key)
        keyValueTable.id = tableland.createTable(
            address(this),
            SQLHelpers.toCreateFromSchema(
                "k TEXT PRIMARY KEY, v TEXT, account TEXT, encryption INTEGER, dateCreated TEXT",
                keyValueTable.prefix
            )
        );

        keyValueTable.name = SQLHelpers.toNameFromId(keyValueTable.prefix, keyValueTable.id);
    }

    // Tableland insert query
    function _insertMember(uint256 _memberId, address _memberAddress) internal {
        Table memory memberTable = tables[MEMBERS_TABLE];

        if (memberTable.id == 0) {
            revert ErrorTableDoesNotExist("Members Table");
        }
        // Prepare SQL
        string memory memberIdString = Strings.toString(_memberId);
        string memory accountString = Strings.toHexString(_memberAddress); // TODO: Costly - is account address needed?
        string memory dateCreatedString = Strings.toString(block.timestamp);

        string memory sql = SQLHelpers.toInsert(
            memberTable.prefix,
            memberTable.id,
            "id, account, dateCreated",
            string.concat(
                memberIdString,
                ",",
                SQLHelpers.quote(accountString),
                ",",
                SQLHelpers.quote(dateCreatedString)
            )
        );

        if (block.chainid == 31337) {
            console.log("Inserting member: %s", sql);
            return;
        }
        // Run Query
        tableland.runSQL(address(this), memberTable.id, sql);
    }

    // Tableland insert query
    function _insertKeyValue(
        string calldata _key,
        string calldata _value,
        KeyValueEncryption _encryptionType
    ) internal {
        Table memory keyValueTable = tables[KEY_VALUE_TABLE];

        if (keyValueTable.id == 0) {
            revert ErrorTableDoesNotExist("Key Value Table");
        }

        // Prepare SQL
        string memory accountString = Strings.toHexString(msg.sender); // TODO: Costly - is account address needed?
        string memory dateCreatedString = Strings.toString(block.timestamp);
        string memory encryptionTypeString = Strings.toString(uint256(_encryptionType));

        string memory sql = SQLHelpers.toInsert(
            keyValueTable.prefix,
            keyValueTable.id,
            "k, v, account, encryption, dateCreated",
            string.concat(
                SQLHelpers.quote(_key),
                ",",
                SQLHelpers.quote(_value),
                ",",
                SQLHelpers.quote(accountString),
                ",",
                SQLHelpers.quote(encryptionTypeString),
                ",",
                SQLHelpers.quote(dateCreatedString)
            )
        );

        if (block.chainid == 31337) {
            console.log("Inserting member: %s", sql);
            return;
        }
        // Run Query
        tableland.runSQL(address(this), keyValueTable.id, sql);
    }
}
