import { EmbraceApps } from "../types/app";
import Discussions from "../components/app/discussions";
import Governance from "../components/app/governance";
import Chat from "../components/app/chat";
import Social from "../components/app/social";

export const appMappings = {
  [EmbraceApps.CHAT_SERVER]: {
    title: "Chat",
    route: "chat",
    component: Chat,
  },
  [EmbraceApps.DISCUSSIONS]: {
    title: "Discussions",
    route: "discussions",
    component: Discussions,
  },
  [EmbraceApps.SOCIAL]: {
    title: "Social",
    route: "social",
    component: Social,
  },
  [EmbraceApps.GOVERNANCE]: {
    title: "Governance",
    route: "governance",
    component: Governance,
  },
};
