import { Router } from "next/router";
import { Space } from "../../../types/space";
import ChatMessenger from "./ChatMessenger";
import VideoCalling from "./VideoCalling";
import { useCallback, useEffect, useRef, useState } from "react";
import Icons from "../../Icons";
import useXmtp from "../../../hooks/useXmtp";
import { Client, DecodedMessage, Message } from "@xmtp/xmtp-js";
import { format } from "date-fns";

const Chatmsg = ({ msgcontent }) => {
  return (
    <div className="my-2 w-full mb-6">
      <div className="flex flex-row w-full items-center justify-start mb-2">
        <div className="w-[20px] h-[20px] bg-slate-200 rounded-[10px]"></div>
        <p className="font-semibold text-[12px] opacity-50 ml-3">
          {msgcontent ? msgcontent.sender.name : ""}
          <span className="font-normal ml-4">
            {msgcontent ? msgcontent.date.toString() : ""}
          </span>
        </p>
      </div>
      <p className="text-[14px] leading-[24px]">
        {msgcontent ? msgcontent.msg : ""}
      </p>
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
  const [chatMessages, setChatMessages] = useState<any[] | null>([]);
  const [fetchNewChatMessages, setFetchNewChatMessages] = useState(true);
  const [lastMessageDate, setLastMessageDate] = useState<Date | null>(null);
  const [xmtpClient, setXmtpClient] = useState<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const xmtp = useXmtp();
  const spaceMembers = [
    "0xCa8454AFbC91cFfe20E726725beB264AE5Bb52FC",
    "0x725Acc62323480E9565fBbfAC8573908e4EEF883",
    "0xB64A31a65701f01a1e63844216f3DbbCC9b3cF2C",
  ]; // Need to get from contract

  const initXmtp = useCallback(async () => {
    if (xmtpClient) return;

    const client = await xmtp.auth();
    if (!client) return;

    setXmtpClient(client);
  }, [xmtp, xmtpClient]);

  useEffect(() => {
    initXmtp();
  }, [initXmtp]);

  useEffect(() => {
    const getMessages = async () => {
      if (xmtpClient && fetchNewChatMessages) {
        const messages = await xmtp.getGroupMessages(
          xmtpClient,
          spaceConversationId,
          lastMessageDate,
        );

        const mappedMessages = messages?.map((msg) => {
          return {
            sender: {
              name: msg.senderAddress,
              avatar: "",
            },
            msg: msg.content,
            date: format(msg.sent, "dd/MM/yyyy"),
            time: null,
          };
        });

        if (mappedMessages && mappedMessages.length > 0) {
          if (lastMessageDate && chatMessages) {
            setChatMessages([...chatMessages, ...mappedMessages]);
          } else {
            setChatMessages(mappedMessages);
          }
        }

        setFetchNewChatMessages(false);
        setLastMessageDate(new Date(Date.now()));
        scrollToBottom();
      }
    };

    getMessages();
  }, [
    spaceConversationId,
    xmtp,
    xmtpClient,
    fetchNewChatMessages,
    lastMessageDate,
    chatMessages,
  ]);

  const sendMessage = async (message: string) => {
    if (xmtpClient) {
      console.log("SENDING MESSAGE", spaceMembers, message);

      await xmtp.sendGroupMessage(
        xmtpClient,
        spaceMembers,
        message,
        spaceConversationId,
      );

      // add message to chatMessages
      // const newMessage = {
      //   sender: {
      //     name: xmtpClient.address,
      //     avatar: "",
      //   },
      //   msg: message,
      //   date: format(new Date(), "dd/MM/yyyy"),
      //   time: null,
      // };

      // setChatMessages((prev) => [...prev, newMessage]);
      // scrollToBottom();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("interval");
      setFetchNewChatMessages(true);
    }, 2000);

    return () => {
      console.log("clearing interval");
      clearInterval(interval);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

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

  return (
    <div className="w-full flex flex-row grow min-h-0">
      <div className="w-[25vw] min-h-0 flex flex-col">
        <ul className="grow overflow-auto h-[1px] pl-[6.8vw] pt-10 pb-20">
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
        <div className="w-full min-h-1 h-[50%] bg-black flex flex-col hidden">
          <div className="grow h-[1px] overflow-auto flex flex-row flex-wrap justify-center align-top py-6">
            {[0, 1, 2, 3, 4].map((room, i) => {
              return (
                <div
                  key={i}
                  className="w-[180px] h-[110px] py-[10px] px-[10px] flex flex-col justify-center align-middle"
                >
                  <div className="bg-white w-full h-full">
                    I&apos;m a videoscreen!
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grow overflow-auto h-[1px]">
          <div className="pt-8">
            {chatMessages &&
              chatMessages.map((msgcontent, i) => {
                return <Chatmsg key={i} msgcontent={msgcontent} />;
              })}
            <div ref={messagesEndRef} className="h-0" />
          </div>
        </div>
        <div className="pt-2 pb-8">
          <input
            type="text"
            name="name"
            id="name"
            className="w-[90%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-700 focus:ring-violet-700 focus:bg-white sm:text-sm"
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
      <div className="w-[25vw] min-w-[290px] min-h-0 flex flex-col pl-10 pt-10">
        <div className="grow overflow-auto h-[1px]">
          <button className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center">
            <Icons.Video extraClass=" mr-2" />
            channel video call
          </button>
          <button className="rounded-full border-embracedark border-2 bg-transparent text-embracedark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center mt-4">
            <Icons.Audio allClass="w-6 h-6 mr-2" />
            channel audio call
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
