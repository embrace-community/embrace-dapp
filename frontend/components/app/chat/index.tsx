import { Router } from "next/router";
import { Space } from "../../../types/space";
import ChatMessenger from "./ChatMessenger";
import VideoCalling from "./VideoCalling";
import { useState } from "react";
import Icons from "../../Icons";

const Chatmsg = ({ msgcontent }) => {
  return (
    <div className="my-2 w-full mb-6">
      <div className="flex flex-row w-full items-center justify-start mb-2">
        <div className="w-[20px] h-[20px] bg-slate-200 rounded-[10px]"></div>
        <p className="font-semibold text-[12px] opacity-50 ml-3">
          {msgcontent ? msgcontent.sender.name : ""}
          <span className="font-normal ml-4">
            {msgcontent ? msgcontent.date : ""}
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
  const jimmmyswordsofwisdomandguidance = [
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Did you ever consider: a horse?",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Vestibulum luctus ullamcorper suscipit. Integer maximus iaculis risus, quis pharetra dolor molestie vel. Suspendisse euismod, quam sit amet dictum auctor, ligula ante laoreet nisi, ac mollis eros arcu sit amet turpis. Pellentesque lacinia felis at arcu condimentum eleifend. Duis placerat, ipsum eget pretium vehicula, nisl nisi hendrerit tellus, a semper felis orci et sapien. Aliquam maximus tempus augue, aliquam gravida tellus aliquam quis. Nam viverra facilisis est...",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Hello? Anyone here? God Im so lonely",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Did you ever consider: a horse?",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Vestibulum luctus ullamcorper suscipit. Integer maximus iaculis risus, quis pharetra dolor molestie vel. Suspendisse euismod, quam sit amet dictum auctor, ligula ante laoreet nisi, ac mollis eros arcu sit amet turpis. Pellentesque lacinia felis at arcu condimentum eleifend. Duis placerat, ipsum eget pretium vehicula, nisl nisi hendrerit tellus, a semper felis orci et sapien. Aliquam maximus tempus augue, aliquam gravida tellus aliquam quis. Nam viverra facilisis est...",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Hello? Anyone here? God Im so lonely",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      date: "yesterday",
      time: "11:45",
    },
    {
      sender: {
        name: "Jimmy",
        avatar: "",
      },
      msg: "Lonsectetur adipiscing elit. Sed suscipit, nulla id tempus dapibus? Opu Sed suscipit, nulla id tem ipsum dolor sit amet, corem...",
      date: "yesterday",
      time: "11:45",
    },
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
        <div className="w-full min-h-1 h-[50%] bg-black  flex flex-col">
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
            {jimmmyswordsofwisdomandguidance.map((msgcontent, i) => {
              return <Chatmsg key={i} msgcontent={msgcontent} />;
            })}
          </div>
        </div>
        <div className="pt-2 pb-8">
          <input
            type="text"
            name="name"
            id="name"
            className="w-[90%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
            placeholder="your message"
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
    //         className="w-[90%] block bg-transparent text-embracedark rounded-md border-embracedark border-opacity-20 shadow-sm focus:border-violet-500 focus:ring-violet-500 focus:bg-white sm:text-sm"
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
