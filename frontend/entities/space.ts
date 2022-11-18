import { EmbraceSpaces } from "../data/contractTypes/EmbraceSpaces";
import { Membership, Space, Visibility } from "../types/space";

export class InternalSpaces {
  constructor(public spaces: InternalSpace[]) {}

  static from_dto(embraceSpaces: EmbraceSpaces.SpaceStructOutput[]) {
    const internalSpaces: InternalSpace[] = embraceSpaces.map(
      (space: EmbraceSpaces.SpaceStructOutput) => {
        const visibility = Visibility[Visibility[space.visibility]];

        const membership: Membership = {
          access: space.membership.access,
          gate: space.membership.gate,
          allowRequests: space.membership.allowRequests,
        };

        return {
          id: space.id.toNumber(),
          handle: space.handle,
          founder: space.founder,
          visibility,
          membership,
          apps: space.apps.map((app) => app.toNumber()),
          metadata: space.metadata,
          memberCount: 0,
        };
      }
    );

    return internalSpaces;
  }
}

export class InternalSpace implements Space {
  constructor(
    public id: number,
    public handle: string,
    public founder: string,
    public visibility: Visibility,
    public membership: Membership,
    public apps: number[],
    public metadata: string,
    public memberCount: number
  ) {}
}
