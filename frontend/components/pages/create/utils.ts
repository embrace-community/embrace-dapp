import { Access } from "../../../utils/types";

export const visOptions = [
  { id: "public", title: "Public" },
  { id: "private", title: "Private" },
  { id: "anonymous", title: "Anonymous" },
];

export const memberAccessOptions = [
  { id: Access.OPEN, title: "Open" },
  { id: Access.GATED, title: "Token Gated" },
  { id: Access.CLOSED, title: "Closed" },
];

export const memberTokenOptions = [
  { id: "erc20", title: "ERC20" },
  { id: "erc721", title: "ERC721" },
  { id: "erc1155", title: "ERC1155" },
];

export function setNextVisibility({
  e,
  setVisibility,
  i,
  membershipAccess,
  setMembershipAccess,
}) {
  {
    if (e.target.checked) {
      setVisibility(i);

      if (
        i === visOptions.findIndex((opt) => opt.id === "public") &&
        membershipAccess ===
          memberAccessOptions.findIndex((opt) => opt.id === Access.CLOSED)
      ) {
        setMembershipAccess(Access.OPEN);
      }

      if (
        i === visOptions.findIndex((opt) => opt.id === "private") &&
        membershipAccess ===
          memberAccessOptions.findIndex((opt) => opt.id === Access.OPEN)
      ) {
        setMembershipAccess(Access.GATED);
      }

      if (
        i === visOptions.findIndex((opt) => opt.id === "anonymous") &&
        membershipAccess ===
          memberAccessOptions.findIndex((opt) => opt.id === Access.OPEN)
      ) {
        setMembershipAccess(Access.GATED);
      }
    }
  }
}

export function setNextMembershipAccess({
  e,
  setMembershipAccess,
  i,
  visibility,
  setVisibility,
}) {
  if (e.target.checked) {
    setMembershipAccess(i);

    if (
      i === memberAccessOptions.findIndex((opt) => opt.id === Access.CLOSED) &&
      visibility === visOptions.findIndex((opt) => opt.id === "public")
    ) {
      setVisibility(visOptions.findIndex((opt) => opt.id === "private"));
    }

    if (
      i === memberAccessOptions.findIndex((opt) => opt.id === Access.OPEN) &&
      visibility === visOptions.findIndex((opt) => opt.id === "private")
    ) {
      setVisibility(visOptions.findIndex((opt) => opt.id === "public"));
    }
  }
}
