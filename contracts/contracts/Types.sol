// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

enum Visibility {
    LISTED,
    UNLISTED
    // ,ANONYMOUS - Unlisted + all metadata is encrypted unless you are a member | founder
}

enum Access {
    OPEN, // Anyone can join
    GATED, // Anyone can join if they meet the requirements
    CLOSED, // Invite only
    PASSWORD // Anyone can join if they have the password
}

enum MembershipGateToken {
    NONE,
    ERC20,
    ERC721,
    ERC1155
}

struct MembershipGate {
    // uint256 chainId;
    MembershipGateToken tokenType;
    address tokenAddress;
    uint256 tokenId; // For ERC1155 only
}

// struct Membership {
//     Access access;
//     MembershipGate gate;
//     // Only relevant if Access is Closed
//     // If true allow requests to join / if false only Admin's can add members
//     // bool allowRequests;
// }

struct CommunityData {
    string handle;
    Visibility visibility;
    Access access;
    MembershipGate membershipGate;
    uint128[] apps;
    string metadata;
}
