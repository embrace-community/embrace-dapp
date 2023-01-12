import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  MembershipGateToken,
  Access,
  Visibility,
  SpaceMembership,
  Space,
} from "../../types/space";
import EnsAvatar from "../EnsAvatar";
import Spinner from "../Spinner";

export default function Header({
  space,
  isFounder,
  accountMembership,
  membershipInfoLoaded,
  joinSpace,
  requestJoinSpace,
  joinSpaceLoading,
}: {
  space: Space;
  isFounder: boolean;
  accountMembership: SpaceMembership | undefined;
  membershipInfoLoaded: boolean;
  joinSpace: () => void;
  requestJoinSpace: () => void;
  joinSpaceLoading: boolean;
}) {
  const visibility = Visibility[space?.visibility];
  const access = Access[space?.membership?.access];
  const membershipGateToken =
    MembershipGateToken[space?.membership?.gate?.token];
  const allowRequests = space?.membership?.allowRequests;
  const [aboutShow, toggleAboutShow] = useState<boolean>(false);
  const { address } = useAccount();

  return (
    <div className="w-full flex flex-col pt-6 md:pl-[6.8vw]">
      <div className="w-full flex flex-col md:flex-row justify-start items-center md:items-start border-b-2 border-embrace-dark border-opacity-5 mb-4">
        {space.loadedMetadata?.image ? (
          <Image
            className="w-20 h-20 rounded-full mb-5 bg-white"
            src={space.loadedMetadata?.image}
            alt="Space Image"
            height={80}
            width={80}
          />
        ) : (
          <span className="w-28 h-28 rounded-full mb-5"></span>
        )}
        <div className="w-full flex flex-col items-center md:items-start md:flex-row md:pl-7 md:pr-10 pb-5">
          <div className="flex-1">
            <h1 className="font-semibold text-2xl mb-1">
              {space.loadedMetadata?.name}
            </h1>
            <div className="">
              <div className="w-full flex flex-row text-sm">
                <p
                  className="underline font-semibold cursor-pointer"
                  onClick={() => toggleAboutShow(!aboutShow)}
                >
                  about
                </p>
                <p className="text-embrace-dark opacity-20 mx-4">|</p>

                {!accountMembership?.isActive && (
                  <>
                    <p className="text-embrace-dark opacity-50">
                      You&apos;re not a member
                    </p>
                  </>
                )}

                {accountMembership?.isActive && (
                  <div className="flex flex-row">
                    <EnsAvatar address={address} avatarOnly={true} />
                  </div>
                )}

                {accountMembership?.isActive && isFounder && (
                  <div className="flex flex-row">
                    <p className="text-embrace-dark opacity-50">
                      You are the founder
                    </p>
                  </div>
                )}

                {accountMembership?.isActive &&
                  accountMembership?.isAdmin &&
                  !isFounder && (
                    <div className="flex flex-row">
                      <p className="text-embrace-dark opacity-50">
                        You&apos;re an admin
                      </p>
                    </div>
                  )}

                {accountMembership?.isActive &&
                  !accountMembership?.isAdmin &&
                  !isFounder && (
                    <div className="flex flex-row">
                      <p className="text-embrace-dark opacity-50">
                        You&apos;re a member
                      </p>
                    </div>
                  )}
              </div>
              {membershipInfoLoaded && (
                <div className="mt-4">
                  {/* When Public Open space and not a member allow joining */}
                  {space.membership.access == Access.OPEN &&
                    space.visibility == Visibility.PUBLIC &&
                    !accountMembership?.isActive && (
                      <button
                        className={classNames({
                          "rounded-full border-violet-600 border-2 bg-transparent text-violet-600 text-sm font-semibold py-2 px-7":
                            true,
                          "opacity-50": joinSpaceLoading,
                        })}
                        onClick={() => joinSpace()}
                        disabled={joinSpaceLoading}
                      >
                        {joinSpaceLoading ? (
                          <Spinner widthHeight={6} />
                        ) : (
                          "join space"
                        )}
                      </button>
                    )}

                  {/* When Private Closed space which allows requests. Address not a member and no pending request, then allow requests */}
                  {space?.membership?.access == Access.CLOSED &&
                    space?.visibility == Visibility.PRIVATE &&
                    space?.membership?.allowRequests &&
                    !accountMembership?.isActive &&
                    !accountMembership?.isRequest && (
                      <button
                        className={classNames({
                          "rounded-full border-violet-600 border-2 bg-transparent text-violet-600 text-sm font-semibold py-2 px-7":
                            true,
                          "opacity-50": joinSpaceLoading,
                        })}
                        onClick={() => requestJoinSpace()}
                        disabled={joinSpaceLoading}
                      >
                        {joinSpaceLoading ? (
                          <Spinner widthHeight={6} />
                        ) : (
                          "request to join"
                        )}
                      </button>
                    )}
                  {accountMembership?.isRequest && (
                    <p className="text-embrace-dark opacity-20 text-right">
                      Request pending...
                    </p>
                  )}

                  {/* When Private Closed space which allows requests. Address not a member and no pending request, then allow requests */}
                  {space?.membership.access == Access.CLOSED &&
                    space?.visibility == Visibility.PRIVATE &&
                    space?.membership?.allowRequests &&
                    !accountMembership?.isActive &&
                    !accountMembership?.isRequest && (
                      <button
                        className={classNames({
                          "rounded-full border-violet-600 border-2 bg-transparent text-violet-600 text-sm font-semibold py-2 px-7":
                            true,
                          "opacity-50": joinSpaceLoading,
                        })}
                        onClick={() => requestJoinSpace()}
                        disabled={joinSpaceLoading}
                      >
                        {joinSpaceLoading ? (
                          <Spinner widthHeight={6} />
                        ) : (
                          "request to join"
                        )}
                      </button>
                    )}

                  {accountMembership?.isRequest && (
                    <p className="text-embrace-dark opacity-20 text-right">
                      Request pending...
                    </p>
                  )}

                  {/* Gated space and not a member then allow join 
            TODO: Only show if the account meets the gate requirements*/}
                  {space?.membership?.access == Access.GATED &&
                    !accountMembership?.isActive && (
                      <button
                        className={classNames({
                          "rounded-full border-violet-600 border-2 bg-transparent text-violet-600 text-sm font-semibold py-2 px-7":
                            true,
                          "opacity-50": joinSpaceLoading,
                        })}
                        onClick={() => requestJoinSpace()}
                        disabled={joinSpaceLoading}
                      >
                        {joinSpaceLoading ? (
                          <Spinner widthHeight={6} />
                        ) : (
                          "request to join"
                        )}
                      </button>
                    )}
                </div>
              )}
              <div className={aboutShow ? "" : "hidden"}>
                <div className="w-full flex flex-row mt-5 text-sm">
                  <p className="text-embrace-dark">
                    {space.loadedMetadata?.description}
                  </p>
                </div>
                <div className="w-full flex flex-row mt-2 text-sm ">
                  <p className="text-embrace-dark">
                    {space?.memberCount} Members
                  </p>
                </div>
                <div className="w-full flex flex-row mt-1 text-sm">
                  <p className="text-embrace-dark">
                    Visibility: {visibility}
                    <br />
                    Access: {access}
                    <br />
                    {space?.visibility == Visibility.PRIVATE && (
                      <>Membership Gate: {membershipGateToken}</>
                    )}
                    <br />
                    {space?.visibility == Visibility.PRIVATE && (
                      <>Allow Requests: {allowRequests ? "Yes" : "No"}</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
