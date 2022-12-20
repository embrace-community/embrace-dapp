import { EmbraceApps } from "../types/app";
import Discussions from "../components/app/discussions";
import Governance from "../components/app/governance";
import Chat from "../components/app/chat";
import Social from "../components/app/social";
import Creations from "../components/app/creations";
import LiveStreaming from "../components/app/live-streaming";

import {
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  VideoCameraIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BuildingLibraryIcon,
  CommandLineIcon,
  BanknotesIcon,
  StarIcon,
  CalendarDaysIcon,
  TicketIcon,
  AcademicCapIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

export const appMappings = {
  [EmbraceApps.SOCIAL]: {
    title: "Social",
    route: "social",
    component: Social,
    icon: UserCircleIcon,
    description:
      "Decentralised social; enabling you to reach your community through Lens and other social media platforms, such as Twitter, all in one place.  Own your data and control your privacy.",
    tags: ["social", "creator"],
  },
  [EmbraceApps.CREATIONS]: {
    title: "Creations",
    route: "creations",
    component: Creations,
    icon: StarIcon,
    description:
      "Share your creations with your community.  Mint collectible creations and earn from your content.  All media is saved to decentralised storage and can be easily distributed across your social channels.",
    tags: ["social", "creator", "video"],
  },
  [EmbraceApps.CHAT_SERVER]: {
    title: "Chat Server",
    route: "chat",
    component: Chat,
    icon: ChatBubbleLeftEllipsisIcon,
    description:
      "Decentralised chat server to allow members of your community to communicate with each other.  Using XMTP for decentralised E2E encrypted chat channels; Huddle SDK with LivePeer for video calls.",
    tags: ["social", "video"],
  },
  [EmbraceApps.LIVE_STREAMING]: {
    title: "Live Streaming",
    route: "live-streaming",
    component: LiveStreaming,
    icon: VideoCameraIcon,
    description:
      "Live streaming of your content to your community.  Using LivePeer for decentralised live streaming.",
    tags: ["social", "creator", "video"],
  },
  [EmbraceApps.COURSES]: {
    title: "Courses",
    route: "coursess",
    component: null,
    icon: AcademicCapIcon,
    description:
      "Courses to share with your community.  Courses can be public, members only or priced individually.  On-completion, users can receive NFT badges and proof of completion.  All courses are saved to decentralised storage.",
    tags: ["creator", "video", "education"],
  },
  [EmbraceApps.PAGES]: {
    title: "Pages",
    route: "pages",
    component: null,
    icon: DocumentTextIcon,
    description:
      "Pages for your community to share information and content.  All pages are saved to decentralised storage.",
    tags: ["social", "dao", "wiki"],
  },
  [EmbraceApps.MARKETPLACE]: {
    title: "Marketplace",
    route: "marketplace",
    component: null,
    icon: ShoppingCartIcon,
    description:
      "Decentralised marketplace for your community to buy and sell goods and services. Accept payments in crypto or fiat.",
    tags: ["commerce"],
  },
  [EmbraceApps.DISCUSSIONS]: {
    title: "Discussions",
    route: "discussions",
    component: Discussions,
    icon: ChatBubbleLeftRightIcon,
    description:
      "Discussions for your community to share ideas and opinions.  Import an existing Discourse forum or create a new decentralised discussion forum.",
    tags: ["social", "dao"],
  },
  [EmbraceApps.GOVERNANCE]: {
    title: "Governance",
    route: "governance",
    component: Governance,
    icon: BuildingLibraryIcon,
    description:
      "Decentralised governance for your community.  Create proposals using Snapshot or create a new decentralised governance system.",
    tags: ["social", "dao"],
  },
  [EmbraceApps.CONTRIBUTIONS]: {
    title: "Contributions",
    route: "contributions",
    component: null,
    icon: CommandLineIcon,
    description:
      "Allow your whole community to contribute to your project.  Create tasks and bounties for your community to complete.",
    tags: ["social", "dao"],
  },
  [EmbraceApps.FUNDRAISING]: {
    title: "Fundraising",
    route: "fundraising",
    component: null,
    icon: BanknotesIcon,
    description:
      "Fundraising for your community.  Create a fundraising campaign to raise funds for your project.",
    tags: ["social", "dao"],
  },
  [EmbraceApps.EVENTS]: {
    title: "Events",
    route: "events",
    component: null,
    icon: TicketIcon,
    description:
      "Events for your community to share information and content.  Sell tickets for your events.",
    tags: ["social", "dao"],
  },
  [EmbraceApps.CALENDAR]: {
    title: "Calendar",
    route: "calendar",
    component: null,
    icon: CalendarDaysIcon,
    description: "Calendar to share important dates with your community.",
    tags: ["social", "dao"],
  },
  [EmbraceApps.FILE_SHARE]: {
    title: "File Sharing",
    route: "file-share",
    component: null,
    icon: ShareIcon,
    description:
      "File sharing for your community to share information and content between themselves.  All files are saved to decentralised storage.",
    tags: ["social", "dao"],
  },
  // [EmbraceApps.TASKS]: {
  //   title: "Calendar",
  //   route: "calendar",
  //   component: null,
  //   icon: CalendarDaysIcon,
  //   description: "Calendar to share important dates with your community.",
  //   tags: ["social", "dao"],
  // },
};

export const tagColours = {
  social: "green",
  video: "blue",
  creator: "purple",
  dao: "yellow",
};
