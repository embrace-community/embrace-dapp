import { EmbraceSpaces } from "../data/contractTypes/EmbraceSpaces";
import { Membership, Space, SpaceMetadata, Visibility } from "./space";

export class SpaceUtil {
  static from_dto(space: EmbraceSpaces.SpaceStructOutput) {
    const visibility = Visibility[Visibility[space.visibility]];

    const membership: Membership = {
      access: space.membership.access,
      gate: space.membership.gate,
      allowRequests: space.membership.allowRequests,
    };

    console.log(space.handle, "handle");

    return {
      id: space.id.toNumber(),
      handle: space.handle,
      founder: space.founder,
      visibility,
      membership,
      apps: space.apps.map((app) => app.toNumber()),
      metadata: space.metadata,
      memberCount: 0,
    } as Space;
  }
}
