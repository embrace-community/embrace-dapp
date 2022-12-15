import { EmbraceApps } from "../types/app";
import Discussions from "../components/app/discussions";
import Governance from "../components/app/governance";
import Chat from "../components/app/chat";
import Social from "../components/app/social";
import Creations from "../components/app/creations";
import {
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  FilmIcon,
} from "@heroicons/react/24/outline";

export const appMappings = {
  [EmbraceApps.CHAT_SERVER]: {
    title: "Chat",
    route: "chat",
    component: Chat,
    icon: ChatBubbleLeftEllipsisIcon,
    description:
      "Decentralised chat server to allow members of your community to communicate with each other.  Using XMTP for decentralised E2E encrypted chat channels; Huddle SDK with LivePeer for video calls.",
  },
  [EmbraceApps.SOCIAL]: {
    title: "Social",
    route: "social",
    component: Social,
    icon: UserCircleIcon,
    description:
      "Decentralised social; enabling you to reach your community through Lens and other social media platforms, such as Twitter, all in one place.  Own your data and control your privacy.",
  },
  [EmbraceApps.CREATIONS]: {
    title: "Creations",
    route: "creations",
    component: Creations,
    icon: FilmIcon,
    description:
      "Share your creations with your community.  Mint collectible creations and earn from your content.  All media is saved to decentralised storage and can be easily distributed across your social channels.",
  },
  [EmbraceApps.DISCUSSIONS]: {
    title: "Discussions",
    route: "discussions",
    component: Discussions,
  },
  [EmbraceApps.GOVERNANCE]: {
    title: "Governance",
    route: "governance",
    component: Governance,
  },
};
