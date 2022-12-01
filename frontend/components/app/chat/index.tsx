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
      <p className="text-[14px] leading-[24px]">{msg ? msg.content : ""}</p>
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
  const channel = "general";
  const spaceConversationId = `embrace.community/${query.handle}/chat/${channel}`;
  const [chatMessages, setChatMessages] = useState<any[] | null>(null);
  const [fetchNewChatMessages, setFetchNewChatMessages] = useState(true);
  const [messageAdded, setMessageAdded] = useState(true);
  const [lastMessageDate, setLastMessageDate] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const xmtp = useXmtp();
  const { huddle, HuddleClientProvider } = useHuddle(query.handle as string);
  const hasInitialized = useRef(false);
  const { signer } = useSigner();
  const { xmtpClient } = useAppSelector((state: RootState) => state.core);
  const videoRef = useRef<HTMLVideoElement>(null);
  const huddlePeers = useRef({});

  const spaceMembers = [
    "0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC",
    "0x725Acc62323480E9565fBbfAC8573908e4EEF883",
    "0xB64A31a65701f01a1e63844216f3DbbCC9b3cF2C",
  ]; // Need to get from contract

  useEffect(() => {
    if (xmtpClient || hasInitialized.current || !signer) return;

    const init = async () => {
      hasInitialized.current = true;

      const address = await signer.getAddress();

      huddle.initialise(address, `embrace.community/${query.handle}/call`);

      await xmtp.auth();
    };

    init();
  }, [xmtp, xmtpClient, signer, huddle, spaceConversationId, query.handle]);

  useEffect(() => {
    const getMessages = async () => {
      if (xmtpClient && (fetchNewChatMessages || messageAdded)) {
        console.log("getting messages");
        const messages = await xmtp.getGroupMessages(
          spaceConversationId,
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
          // We are only added new messages to the state
          if (lastMessageDate && chatMessages) {
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
        }

        setFetchNewChatMessages(false);
        setMessageAdded(false);
      }
    };

    getMessages();
  }, [
    spaceConversationId,
    xmtp,
    xmtpClient,
    fetchNewChatMessages,
    messageAdded,
    lastMessageDate,
    chatMessages,
  ]);

  const sendMessage = async (message: string) => {
    if (xmtpClient && message.length) {
      console.log("SENDING MESSAGE", spaceMembers, message);

      await xmtp.sendGroupMessage(spaceMembers, message, spaceConversationId);

      setTimeout(() => {
        setMessageAdded(true);
      }, 500);
    }
  };

  // To periodically fetch new messages
  useEffect(() => {
    if (!xmtpClient) return;

    const interval = setInterval(() => {
      console.log("interval");
      setFetchNewChatMessages(true);
    }, 10000);

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
        huddle.client.allowAllLobbyPeersToJoinRoom();
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
      const peerIds = Object.values(huddle.peers).map((peer) => peer.peerId);

      huddlePeers.current = huddle.peers;
      huddle.setPeerIds(peerIds);
    }
  }, [huddle, huddle.peerIds, huddle.peers]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = huddle.stream;
      console.log("set video");
    }

    console.log("Stream", huddle.stream);
    console.log("Roomstate", huddle.roomState);
  }, [huddle.stream, huddle.roomState, videoRef]);

  const jimmmysroomsofwonderandmystery = [
    "Main channel",
    "Guests",
    "Embros4life",
    "Main channel",
    "Guests",
    "Embros4life",
    "Main channel",
    "Guests",
    "Embros4life",
    "Main channel",
    "Guests",
    "Embros4life",
    "Main channel",
    "Guests",
    "Embros4life",
    "Main channel",
    "Guests",
    "Embros4life",
  ];

  console.log("chat index.tsx", query, space);

  // TODO: Page will stay blank if the user doesn't sign XMTP transaction
  if (!xmtpClient)
    return (
      <>
        <Spinner />
      </>
    );

  return (
    <div className="w-full flex flex-row grow min-h-0">
      <div className="w-[15vw] min-h-0 flex flex-col">
        <ul className="grow overflow-auto h-[1px] pl-[2vw] pt-8 pb-20">
          {jimmmysroomsofwonderandmystery.map((room, i) => {
            return (
              <li key={i} className="py-[5px]">
                {room}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <HuddleClientProvider value={huddle.client}>
          {huddle.client && huddle.roomState.joined && (
            <div className="w-full min-h-1 h-[70%] bg-black flex flex-col">
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
        <div className="grow overflow-auto h-[1px]">
          <div className="pt-8">
            {chatMessages ? (
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
        <div className="pt-2 pb-8">
          {chatMessages && chatMessages.length == 0 && (
            <>
              <em>Start a conversation!</em>
            </>
          )}
          <input
            type="text"
            name="name"
            id="name"
            className="w-[100%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-700 focus:ring-violet-700 focus:bg-white sm:text-sm"
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
      <div className="w-[15vw] min-w-[290px] min-h-0 flex flex-col pl-10 pt-8 ">
        <div className="grow overflow-auto h-[1px]">
          <button
            onClick={(e) => huddle.joinCall()}
            className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center"
          >
            <Icons.Video extraClass=" mr-2" />
            join video call
          </button>
          <div className="pt-8">
            {huddle.peerIds.length > 0 && (
              <>There are {huddle.peerIds.length + 1} people in the call</>
            )}
          </div>
          <button className="hidden rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center mt-4">
            <Icons.Audio allClass="w-6 h-6 mr-2" />
            join audio call
          </button>
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
    //         className="w-[90%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-700 focus:ring-violet-700 focus:bg-white sm:text-sm"
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
