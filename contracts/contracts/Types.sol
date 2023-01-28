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

/*
    enum Access {
        OPEN, // Public only
        GATED, // Public or Private
        CLOSED // Private and all Anonymous
    }

    enum MembershipGateToken {
        NONE,
        ERC20,
        ERC721,
        ERC1155
    }

    struct MembershipGate {
        // uint256 chainId;
        MembershipGateToken token;
        address tokenAddress;
    }

    struct Membership {
        Access access;
        MembershipGate gate;
        // Only relevant if space is Private and MemberType is Closed
        // If true allow requests to join / if false only Admin's can add members
        bool allowRequests;
    }
*/

struct CommunityContractData {
    string handle;
    Visibility visibility;
    Membership membership;
    uint128[] apps;
}
