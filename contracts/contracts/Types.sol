// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

enum Visibility {
    Public,
    Private
}

enum Membership {
    Open,
    Closed
}

struct CommunityContractData {
    string handle;
    Visibility visibility;
    Membership membership;
    uint128[] apps;
}
