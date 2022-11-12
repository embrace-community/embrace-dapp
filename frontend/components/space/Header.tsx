import {
  MembershipGateToken,
  Access,
  Visibility,
  SpaceMembership,
} from "../../utils/types";

export default function Header({
  space,
  isFounder,
  membership,
  joinSpace,
  requestJoinSpace,
}: {
  space: any;
  isFounder: boolean;
  membership: SpaceMembership | undefined;
  joinSpace: () => void;
  requestJoinSpace: () => void;
}) {
  const visibility = Visibility[space.visibility];
  const access = Access[space.membership.access];
  const membershipGateToken = MembershipGateToken[space.membership.gate.token];
  const allowRequests = space.membership.allowRequests;

  console.log(space);
  console.log(
    access,
    membershipGateToken,
    allowRequests,
    isFounder,
    membership
  );

  console.log(!membership?.isActive && space.membership.allowRequests);
  return (
    <div className="w-full flex flex-col justify-start text-embracedark extrastyles-specialpadding2">
      <div className="w-full flex flex-row justify-start items-end border-b-2 border-embracedark border-opacity-5 mb-12">
        <img
          className="w-28 h-28 extrastyles-border-radius extrastyles-negmarg"
          src={space?.metadata?.image}
        />
        <div className="mb-6 ml-7">
          <h1 className="font-semibold text-2xl">{space?.metadata?.name}</h1>
          <div className="w-full flex flex-row mt-1 text-sm">
            <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
              {space?.memberCount} Members
            </p>
          </div>
          <div className="w-full flex flex-row mt-1 text-sm">
            <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
              {space?.metadata?.description}
            </p>
          </div>
          <div className="w-full flex flex-row mt-1 text-sm">
            <p className="text-embracedark text-opacity-50 mx-3  mt-4px">
              Visibility: {visibility}
              <br />
              Access: {access}
              <br />
              Membership Gate: {membershipGateToken}
              <br />
              Allow Requests: {allowRequests ? "Yes" : "No"}
            </p>

            {!membership?.isActive && !space.membership.allowRequests && (
              <button
                className="bg-embracelight text-embracedark text-sm font-semibold py-2 px-4 rounded-full ml-3"
                onClick={() => joinSpace()}
              >
                Join
              </button>
            )}

            {!membership?.isActive &&
              space.membership.allowRequests &&
              !membership?.isRequest && (
                <button
                  className="bg-embracelight text-embracedark text-sm font-semibold py-2 px-4 rounded-full ml-3"
                  onClick={() => requestJoinSpace()}
                >
                  Request to Join
                </button>
              )}

            {membership?.isRequest && <>Request pending</>}

            {isFounder && <>You are the founder</>}
            {membership?.isAdmin && <>You are an Admin</>}
          </div>
        </div>
      </div>
    </div>
  );
}
