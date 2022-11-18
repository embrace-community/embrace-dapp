import { EmbraceSpace } from "../types/space";
import { EmbraceSpaces } from "../data/contractTypes/EmbraceSpaces";

export class InternalSpace {
  static from_dto(embraceSpace: EmbraceSpaces.SpaceStructOutput[]) {
    const internalSpaces: EmbraceSpace[] = embraceSpace.map(
      (space: EmbraceSpaces.SpaceStructOutput) => {
        return {
          id: space.id.toNumber(),
          handle: space.handle,
          founder: space.founder,
          visibility: space.visibility,
          membership: space.membership,
          apps: space.apps.map((app) => app.toNumber()),
          metadata: space.metadata,
          memberCount: 0,
        };
      }
    );

    return internalSpaces;
  }
}
