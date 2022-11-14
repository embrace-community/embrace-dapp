import { Access, MembershipGateToken, Visibility } from "../../../utils/types";

export const visOptions = [
  { id: Visibility.PUBLIC, title: "Public" },
  { id: Visibility.PRIVATE, title: "Private" },
  { id: Visibility.ANONYMOUS, title: "Anonymous" },
];

export const memberAccessOptions = [
  { id: Access.OPEN, title: "Open" },
  { id: Access.GATED, title: "Token Gated" },
  { id: Access.CLOSED, title: "Closed" },
];

export const memberTokenOptions = [
  { id: MembershipGateToken.ERC20, title: "ERC20" },
  { id: MembershipGateToken.ERC721, title: "ERC721" },
  { id: MembershipGateToken.ERC1155, title: "ERC1155" },
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
        i === visOptions.findIndex((opt) => opt.id === Visibility.PUBLIC) &&
        membershipAccess ===
          memberAccessOptions.findIndex((opt) => opt.id === Access.CLOSED)
      ) {
        setMembershipAccess(Access.OPEN);
      }

      if (
        i === visOptions.findIndex((opt) => opt.id === Visibility.PRIVATE) &&
        membershipAccess ===
          memberAccessOptions.findIndex((opt) => opt.id === Access.OPEN)
      ) {
        setMembershipAccess(Access.GATED);
      }

      if (
        i === visOptions.findIndex((opt) => opt.id === Visibility.ANONYMOUS) &&
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
      visibility === visOptions.findIndex((opt) => opt.id === Visibility.PUBLIC)
    ) {
      setVisibility(
        visOptions.findIndex((opt) => opt.id === Visibility.PRIVATE)
      );
    }

    if (
      i === memberAccessOptions.findIndex((opt) => opt.id === Access.OPEN) &&
      visibility ===
        visOptions.findIndex((opt) => opt.id === Visibility.PRIVATE)
    ) {
      setVisibility(
        visOptions.findIndex((opt) => opt.id === Visibility.PUBLIC)
      );
    }
  }
}
