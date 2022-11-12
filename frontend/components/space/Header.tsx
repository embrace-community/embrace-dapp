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

            {/* When Public Open space and not a member allow joining */}
            {space.membership.access == Access.OPEN &&
              space.visibility == Visibility.PUBLIC &&
              !membership?.isActive && (
                <button
                  className="bg-embracelight text-embracedark text-sm font-semibold py-2 px-4 rounded-full ml-3"
                  onClick={() => joinSpace()}
                >
                  Join
                </button>
              )}

            {/* When Private Closed space which allows requests. Address not a member and no pending request, then allow requests */}
            {space.membership.access == Access.OPEN &&
              space.visibility == Visibility.PUBLIC &&
              space.membership.allowRequests &&
              !membership?.isActive &&
              !membership?.isRequest && (
                <button
                  className="bg-embracelight text-embracedark text-sm font-semibold py-2 px-4 rounded-full ml-3"
                  onClick={() => requestJoinSpace()}
                >
                  Request to Join
                </button>
              )}

            {/* Gated space and not a member then allow join 
            TODO: Only show if the account meets the gate requirements*/}
            {space.membership.access == Access.GATED && !membership?.isActive && (
              <button
                className="bg-embracelight text-embracedark text-sm font-semibold py-2 px-4 rounded-full ml-3"
                onClick={() => requestJoinSpace()}
              >
                Join Gated space
              </button>
            )}

            {membership?.isActive && <>You are a member</>}
            {membership?.isRequest && <>Request pending</>}
            {membership?.isAdmin && <>You are an Admin</>}

            {isFounder && <>You are the founder</>}
          </div>
        </div>
      </div>
    </div>
  );
}
