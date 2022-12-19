import { Router } from "next/router";
import { Space } from "../../../types/space";
import { useEffect, useRef, useState } from "react";
import Icons from "../../Icons";
import useXmtp from "../../../hooks/useXmtp";
import { format } from "date-fns";
import useSigner from "../../../hooks/useSigner";
import Spinner from "../../Spinner";
import { useAppSelector } from "../../../store/hooks";
import { RootState } from "../../../store/store";
import useHuddle from "../../../hooks/useHuddle";
import PeerVideoAudioElem from "./PeerVideoAudioElem";
import classNames from "classnames";
import HuddleClient from "../../../lib/huddle01-client/HuddleClient/HuddleClient";
import useEmbraceContracts from "../../../hooks/useEmbraceContracts";

const ChatNotification = ({ notification }) => {
  if (notification.endsWith("VIDEO_CALL_STARTED")) {
    return (
      <div className="opacity-50 px-2 text-[14px]">
        <Icons.Video extraClass=" mr-2" /> Video call started
      </div>
    );
  }

  return notification;
};

const Chatmsg = ({ msg }) => {
  return (
    <div className="my-2 w-full mb-6">
      <div className="flex flex-row w-full items-center justify-start mb-2">
        <div className="w-[20px] h-[20px] bg-slate-200 rounded-[10px]"></div>
        <p className="font-semibold text-[12px] opacity-50 ml-3">
          {msg ? msg.sender.name : ""}
          <span className="font-normal ml-4">
            {msg ? format(msg.sent, "dd/MM/yyyy") : ""}
          </span>
        </p>
      </div>
      {msg && msg.content.startsWith("NOTIFY=") ? (
        <ChatNotification notification={msg.content} />
      ) : (
        <p className="text-[14px] leading-[24px] px-2">
          {msg ? msg.content : ""}
        </p>
      )}
    </div>
  );
};

export default function Chat({
  query,
  space,
}: {
  query: Router["query"];
  space: Space;
}) {
  const [showLeftMenu, toggleShowLeftMenu] = useState(true);
  const [showRightMenu, toggleShowRightMenu] = useState(true);
  const [channel, setChannel] = useState("general");
  const [conversationId, setConversationId] = useState("");
  const [channelChanged, setChannelChanged] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[] | null>(null);
  const [fetchNewChatMessages, setFetchNewChatMessages] = useState(true);
  const [lastMessageDate, setLastMessageDate] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const xmtp = useXmtp();
  const { huddle, HuddleClientProvider } = useHuddle(query.handle as string);
  const hasInitialized = useRef(false);
  const { signer } = useSigner();
  const { xmtpClient } = useAppSelector((state: RootState) => state.core);
  const videoRef = useRef<HTMLVideoElement>(null);
  const huddlePeers = useRef({});
  const initiatedCall = useRef(false);
  const { spacesContract } = useEmbraceContracts();
  const [spaceMembers, setSpaceMembers] = useState<string[]>([]);

  useEffect(() => {
    if (!spacesContract || !space.id || spaceMembers.length) return;

    const getSpaceMembers = async () => {
      try {
        const members = await spacesContract.getSpaceMembers(space.id);
        setSpaceMembers(members);
      } catch (err: any) {
        console.log("Error getting space members", err);
      }
    };

    getSpaceMembers();
  }, [spacesContract, space.id, spaceMembers]);

  useEffect(() => {
    if (xmtpClient || hasInitialized.current || !signer) return;

    const init = async () => {
      hasInitialized.current = true;

      const address = await signer.getAddress();

      huddle.initialise(
        address,
        `embrace.community/${space.handle}-${space.id}/call`,
      );

      await xmtp.auth();
    };

    init();
  }, [xmtp, xmtpClient, signer, huddle, conversationId, space]);

  useEffect(() => {
    const getMessages = async () => {
      if (
        xmtpClient &&
        conversationId &&
        (fetchNewChatMessages || channelChanged)
      ) {
        console.log("getting messages", conversationId);

        const messages = await xmtp.getGroupMessages(
          conversationId,
          lastMessageDate,
        );

        const mappedMessages = messages?.map((msg) => {
          return {
            sender: {
              name: msg.senderAddress,
              avatar: "",
            },
            content: msg.content,
            sent: msg.sent,
            time: null,
          };
        });

        if (mappedMessages && mappedMessages.length > 0) {
          if (channelChanged) {
            setChatMessages(mappedMessages);
            console.log(mappedMessages, "new channel messages");
          } else if (lastMessageDate && chatMessages) {
            // We are only added new messages to the state
            setChatMessages([...chatMessages, ...mappedMessages]);
          } else {
            // We are loading all messages available
            setChatMessages(mappedMessages);
            console.log(mappedMessages, "messages");
          }

          // Now we are setting the last message date to the last message we got
          // So we only fetch messages after this date
          if (mappedMessages[mappedMessages.length - 1].sent) {
            new Date(mappedMessages[mappedMessages.length - 1].sent),
              setLastMessageDate(new Date(Date.now()));
          }
        } else if (!chatMessages || channelChanged) {
          // To show on UI that messages have been loaded but none exist
          setChatMessages([]);
        }

        console.log("mappedMessages", mappedMessages);

        setFetchNewChatMessages(false);
        setChannelChanged(false);
      }
    };

    getMessages();
  }, [
    conversationId,
    xmtp,
    xmtpClient,
    fetchNewChatMessages,
    lastMessageDate,
    chatMessages,
    channelChanged,
  ]);

  // Whenever channel is changed then this will update the conversationId and trigger messages to be loaded
  useEffect(() => {
    setConversationId(
      `embrace.community/${space.handle}-${space.id}/chat/${channel}`,
    );
    setLastMessageDate(null);
    setChannelChanged(true);
  }, [channel, space]);

  const sendMessage = async (message: string) => {
    if (xmtpClient && message.length) {
      console.log("SENDING MESSAGE", spaceMembers, message);

      const newMessage = {
        sender: {
          name: xmtpClient.address,
          avatar: "",
        },
        content: message,
        sent: new Date(Date.now()),
        time: null,
      };

      await xmtp.sendGroupMessage(spaceMembers, message, conversationId);

      if (chatMessages) {
        setChatMessages([...chatMessages, newMessage]);
      } else {
        setChatMessages([newMessage]);
      }
    }
  };

  // To periodically fetch new messages
  useEffect(() => {
    if (!xmtpClient) return;

    const interval = setInterval(() => {
      setFetchNewChatMessages(true);
    }, 5000);

    // Clear interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [xmtpClient]);

  // To make sure newest messages are visible
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  // When there are new lobby peers then auto join the call
  useEffect(() => {
    if (huddle.lobbyPeers.length > 0) {
      try {
        huddle.client?.allowAllLobbyPeersToJoinRoom();
      } catch (error) {
        console.log({ error });
      }
    }
  }, [huddle.client, huddle.lobbyPeers]);

  useEffect(() => {
    if (
      // Object.values(huddle.peers).length > 0 &&
      huddle.peers !== huddlePeers.current
    ) {
      console.log("PEERS", huddle.peers);
      const peerIds = Object.values(huddle.peers).map((peer) => {
        return peer.peerId;
      });

      huddlePeers.current = huddle.peers;
      huddle.setPeerIds(peerIds);
    }
  }, [huddle, huddle.peerIds, huddle.peers]);

  useEffect(() => {
    if (videoRef.current) {
      console.log("joinCall", huddle.stream, huddle.roomState);
      videoRef.current.srcObject = huddle.stream;
      initiatedCall.current = false;
    }
  }, [huddle.stream, huddle.roomState, videoRef]);

  const channels = ["general", "introductions", "support"];

  const joinCall = async () => {
    if (initiatedCall.current) return;

    initiatedCall.current = true;

    await huddle.joinCall();

    // Send Push Protocol notification to space members to join call
  };

  const toggleMicrophone = async () => {
    huddle.isMicPaused ? huddle.client?.unmuteMic() : huddle.client?.muteMic();
  };

  const changeChannel = (channel: string) => {
    setChannel(channel);
    setChatMessages(null);
  };

  console.log("chat index.tsx", query, space);

  // TODO: Page will stay blank if the user doesn't sign XMTP transaction
  if (!xmtpClient && signer)
    return (
      <>
        <Spinner />
      </>
    );

  if (!signer)
    return (
      <>
        <div>You must be connected to view the chat</div>
      </>
    );

  return (
    <div className="w-full flex flex-row grow min-h-0">
      <div className="w-[15vw] min-h-0 flex flex-col">
        <ul className="grow overflow-auto h-[1px] pb-20 my-1 sm:m-4">
          <h3 className="text-lg font-medium leading-6 text-gray-900 sm:truncate mb-5">
            Channels
          </h3>
          {channels.map((_channel, i) => {
            return (
              <li
                key={i}
                className={classNames({
                  "py-[5px] cursor-pointer rounded-md p-2 mr-5": true,
                  "bg-gray-100 ": channel === _channel,
                })}
                onClick={() => changeChannel(_channel)}
              >
                {_channel}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <HuddleClientProvider value={huddle.client as HuddleClient}>
          {huddle.client && huddle.roomState.joined && (
            <div className="w-full min-h-1 h-[66%] bg-black flex flex-col mb-2">
              <div className="grow h-[1px] overflow-auto flex flex-row flex-wrap justify-center align-top relative">
                {videoRef && (
                  <div className="border-gray-100 border-2 h-[85px] w-[150px] absolute right-5 bottom-5 overflow-hidden">
                    <video ref={videoRef} autoPlay></video>
                  </div>
                )}

                {Object.values(huddle.peers).length === 0 && (
                  <div className="h-full w-full flex flex-col justify-center  items-center align-middle text-gray-100">
                    <h1>Waiting for people to join call...</h1>
                  </div>
                )}

                {Object.values(huddle.peers).length === 1 && (
                  <div className="h-full w-full flex flex-col justify-center align-middle overflow-hidden">
                    <PeerVideoAudioElem
                      peerIdAtIndex={huddle.peers[huddle.peerIds[0]]?.peerId}
                    />
                  </div>
                )}

                {Object.values(huddle.peers).length === 2 && (
                  <>
                    <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                      <PeerVideoAudioElem
                        peerIdAtIndex={huddle.peers[huddle.peerIds[0]]?.peerId}
                      />
                    </div>
                    <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                      <PeerVideoAudioElem
                        peerIdAtIndex={huddle.peers[huddle.peerIds[1]]?.peerId}
                      />
                    </div>
                  </>
                )}

                {Object.values(huddle.peers).length === 3 && (
                  <>
                    <div className="h-[50%] w-full flex flex-row justify-center align-middle overflow-hidden">
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[0]]?.peerId
                          }
                        />
                      </div>
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[1]]?.peerId
                          }
                        />
                      </div>
                    </div>
                    <div className="h-[50%] w-full flex flex-row justify-center align-middle overflow-hidden">
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[2]]?.peerId
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {Object.values(huddle.peers).length === 4 && (
                  <>
                    <div className="h-[50%] w-full flex flex-row justify-center align-middle overflow-hidden">
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[0]]?.peerId
                          }
                        />
                      </div>
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[1]]?.peerId
                          }
                        />
                      </div>
                    </div>
                    <div className="h-[50%] w-full flex flex-row justify-center align-middle overflow-hidden">
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[2]]?.peerId
                          }
                        />
                      </div>
                      <div className="h-full w-[50%] flex flex-col justify-center align-middle overflow-hidden">
                        <PeerVideoAudioElem
                          peerIdAtIndex={
                            huddle.peers[huddle.peerIds[3]]?.peerId
                          }
                        />
                      </div>
                    </div>
                  </>
                )}

                {Object.values(huddle.peers).length > 4 &&
                  Object.values(huddle.peers).map((peer, i) => (
                    <div
                      key={i}
                      className="w-[200px] flex flex-col justify-center align-middle p-5"
                    >
                      <PeerVideoAudioElem
                        key={peer.peerId}
                        peerIdAtIndex={peer.peerId}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </HuddleClientProvider>
        {!huddle.roomState.joined && (
          <div className="flex md:hidden w-full h-[44px] bg-transparent flex-row justify-end ">
            <div className="flex flex-col justify-center align-middle">
              <button
                onClick={(e) => joinCall()}
                className={classNames({
                  "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold m-2 p-2 flex flex-row items-center":
                    true,
                  "animate-ping m-0 p-0": initiatedCall.current,
                })}
              >
                <Icons.Video />
              </button>
            </div>
          </div>
        )}
        {huddle.roomState.joined && (
          <div className="w-full h-[44px] bg-transparent flex flex-row justify-center">
            <div className="flex flex-col justify-center align-middle">
              <button
                onClick={(e) => toggleMicrophone()}
                className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold m-2 p-2 flex flex-row items-center"
              >
                {huddle.isMicPaused ? (
                  <Icons.MicrophoneMute />
                ) : (
                  <Icons.Microphone />
                )}
              </button>
            </div>

            <div className="flex flex-col justify-center align-middle">
              <button
                onClick={(e) => {
                  huddle.leaveCall();
                }}
                className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold m-2 p-2 flex flex-row items-center"
              >
                <Icons.HangUp />
              </button>
            </div>
          </div>
        )}
        <div className="grow overflow-auto h-[1px]">
          <div className="pt-2">
            {chatMessages && chatMessages?.length >= 0 ? (
              chatMessages.map((msg, i) => {
                return <Chatmsg key={i} msg={msg} />;
              })
            ) : (
              <>
                <Spinner />
              </>
            )}

            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
        <div className="pt-2 pb-6">
          {chatMessages && chatMessages.length == 0 && (
            <>{/* <em>Start a conversation!</em> */}</>
          )}
          <input
            type="text"
            name="name"
            id="name"
            className="w-[100%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
            placeholder="your message"
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                sendMessage(e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      </div>
      <div className="hidden w-[15vw] min-w-[20vw] min-h-0 lg:flex flex-col pl-10 overflow-hidden">
        <div className="grow overflow-auto h-[1px]">
          {!huddle.roomState.joined && (
            <>
              <button
                onClick={(e) => joinCall()}
                // className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center"
                className={classNames({
                  "rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center":
                    true,
                  "animate-pulse m-0 p-0": initiatedCall.current,
                })}
              >
                <Icons.Video extraClass=" mr-2" />
                {initiatedCall.current ? "joining" : "join"} video call
              </button>

              <button className="hidden rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center mt-4">
                <Icons.Audio allClass="w-6 h-6 mr-2" />
                join audio call
              </button>
            </>
          )}

          {huddle.roomState.joined && (
            <h3 className="text-lg font-medium leading-6 text-gray-900 sm:truncate mb-5">
              Call in progress...
            </h3>
          )}

          <div>
            {spaceMembers.length > 0 && (
              <div className="flex flex-row items-center pt-4">
                <div className="text-embracedark text-sm font-semibold">
                  {spaceMembers.length}{" "}
                  {spaceMembers.length <= 1 ? "member" : "members"}
                </div>
              </div>
            )}
            {spaceMembers.length > 0 &&
              spaceMembers.map((member, i) => {
                return (
                  <div
                    className="flex flex-row items-center"
                    key={`i-${member}`}
                  >
                    {/* Only get the first 6 and last 6 characters */}
                    <div>
                      {member.substring(0, 6) +
                        "..." +
                        member.substring(member.length - 6, member.length)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>

    // <div className="w-full flex flex-1 h-full flex-row">
    //     <div className={showLeftMenu?"transition-all w-[360px]  pl-[6.8vw] pt-10":"transition-all w-[0px]"}>
    //       <ul>
    //         {jimmmysroomsofwonderandmystery.map((room,i)=> {
    //           return (<li className="py-[5px]">{room}</li>)
    //         })}
    //       </ul>
    //     </div>
    //     <div className="flex-1 flex flex-col items-start justify-start">
    //       <div className="grow w-full overflow-y-scroll">
    //           <div className="grow">
    //         {jimmmyswordsofwisdomandguidance.map((msgcontent,i)=> {
    //             return (<Chatmsg msgcontent={msgcontent}  />)
    //           })}
    //       </div>
    //       </div>
    //       <div className="w-full pb-20">
    //       <input
    //         type="text"
    //         name="name"
    //         id="name"
    //         className="w-[90%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-600 focus:ring-violet-600 focus:bg-white sm:text-sm"
    //         placeholder="your message"
    //       />
    //       </div>
    //     </div>
    //     <div className={showRightMenu?"transition-all w-[290px] pl-10 pt-10":"transition-all w-[0px]"}>
    //       <button
    //         className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center"
    //       >
    //         <Icons.Video extraClass=" mr-2"/>
    //         channel video call
    //       </button>
    //       <button
    //         className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center mt-4"
    //       >
    //         <Icons.Audio extraClass=" mr-2"/>
    //         channel audio call
    //       </button>
    //     </div>
    // </div>
  );
}
