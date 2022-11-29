import Image from "next/image";
import { useState } from "react";
import {
  MembershipGateToken,
  Access,
  Visibility,
  SpaceMembership,
  Space,
} from "../../types/space";

export default function Header({
  space,
  isFounder,
  membership,
  membershipInfoLoaded,
  joinSpace,
  requestJoinSpace,
}: {
  space: Space;
  isFounder: boolean;
  membership: SpaceMembership | undefined;
  membershipInfoLoaded: boolean;
  joinSpace: () => void;
  requestJoinSpace: () => void;
}) {
  const visibility = Visibility[space?.visibility];
  const access = Access[space?.membership?.access];
  const membershipGateToken =
    MembershipGateToken[space?.membership?.gate?.token];
  const allowRequests = space?.membership?.allowRequests;
  const [aboutShow, toggleAboutShow] = useState(false);

  return (
    <div className="w-full flex flex-col extrastyles-specialpadding2">
      <div className="w-full flex flex-col md:flex-row justify-start items-center md:items-start border-b-2 border-embracedark border-opacity-5 mb-4">
        {space.loadedMetadata?.image ? (
          <Image
            className="w-20 h-20 extrastyles-border-radius extrastyles-negmarg-avatar bg-white"
            src={space.loadedMetadata?.image}
            alt="Space Image"
            height={20}
            width={20}
            unoptimized
          />
        ) : (
          <span className="w-28 h-28 extrastyles-border-radius extrastyles-negmarg-avatar"></span>
        )}
        <div className="w-full flex flex-col items-center md:items-start md:flex-row md:pl-7 md:pr-10 pb-5">
          <div className="flex-1">
            <h1 className="font-semibold text-2xl mb-1">
              {space.loadedMetadata?.name}
            </h1>
            <div className="">
              <div className="w-full flex flex-row text-sm">
                <p
                  className="underline font-semibold"
                  onClick={() => toggleAboutShow(!aboutShow)}
                >
                  about
                </p>
                <p className="text-embracedark opacity-20 mx-4">|</p>

                {!membership?.isActive && (
                  <p className="text-embracedark opacity-50">
                    You&apos;re not a member
                  </p>
                )}

                {membership?.isActive && (
                  <div className="flex flex-row">
                    <Image
                      className="h-5 w-5 rounded-full mr-3"
                      src="https://api.multiavatar.com/Binx Bond.svg"
                      alt="Avatar"
                      height={5}
                      width={5}
                    />
                  </div>
                )}

                {membership?.isActive && isFounder && (
                  <div className="flex flex-row">
                    <p className="text-embracedark opacity-50">
                      You are the founder
                    </p>
                  </div>
                )}

                {membership?.isActive && membership?.isAdmin && !isFounder && (
                  <div className="flex flex-row">
                    <p className="text-embracedark opacity-50">
                      You&apos;re an admin
                    </p>
                  </div>
                )}

                {membership?.isActive && !membership?.isAdmin && !isFounder && (
                  <div className="flex flex-row">
                    <p className="text-embracedark opacity-50">
                      You&apos;re a member
                    </p>
                  </div>
                )}
              </div>
              <div className={aboutShow ? "" : "hidden"}>
                <div className="w-full flex flex-row mt-5 text-sm">
                  <p className="text-embracedark">
                    {space.loadedMetadata?.description}
                  </p>
                </div>
                <div className="w-full flex flex-row mt-2 text-sm ">
                  <p className="text-embracedark">
                    {space?.memberCount} Members
                  </p>
                </div>
                <div className="w-full flex flex-row mt-1 text-sm">
                  <p className="text-embracedark">
                    Visibility: {visibility}
                    <br />
                    Access: {access}
                    <br />
                    Membership Gate: {membershipGateToken}
                    <br />
                    Allow Requests: {allowRequests ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {membershipInfoLoaded && (
            <div className="mt-6 mb-6 md:my-0">
              {/* When Public Open space and not a member allow joining */}
              {space.membership.access == Access.OPEN &&
                space.visibility == Visibility.PUBLIC &&
                !membership?.isActive && (
                  <button
                    className="rounded-full border-violet-700 border-2 bg-transparent text-violet-700 text-sm font-semibold py-2 px-7"
                    onClick={() => joinSpace()}
                  >
                    join space
                  </button>
                )}

              {/* When Private Closed space which allows requests. Address not a member and no pending request, then allow requests */}
              {space?.membership?.access == Access.CLOSED &&
                space?.visibility == Visibility.PRIVATE &&
                space?.membership?.allowRequests &&
                !membership?.isActive &&
                !membership?.isRequest && (
                  <button
                    className="rounded-full border-violet-700 border-2 bg-transparent text-violet-700 text-sm font-semibold py-2 px-7"
                    onClick={() => requestJoinSpace()}
                  >
                    request to join
                  </button>
                )}
              {membership?.isRequest && (
                <p className="text-embracedark opacity-20 text-right">
                  Request pending...
                </p>
              )}

              {/* When Private Closed space which allows requests. Address not a member and no pending request, then allow requests */}
              {space?.membership.access == Access.CLOSED &&
                space?.visibility == Visibility.PRIVATE &&
                space?.membership?.allowRequests &&
                !membership?.isActive &&
                !membership?.isRequest && (
                  <button
                    className="rounded-full border-violet-500 border-2 bg-transparent text-violet-500 text-sm font-semibold py-2 px-7"
                    onClick={() => requestJoinSpace()}
                  >
                    request to join
                  </button>
                )}

              {membership?.isRequest && (
                <p className="text-embracedark opacity-20 text-right">
                  Request pending...
                </p>
              )}

              {/* Gated space and not a member then allow join 
            TODO: Only show if the account meets the gate requirements*/}
              {space?.membership?.access == Access.GATED &&
                !membership?.isActive && (
                  <button
                    className="rounded-full border-violet-500 border-2 bg-transparent text-violet-500 text-sm font-semibold py-2 px-7"
                    onClick={() => requestJoinSpace()}
                  >
                    join gated space
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
