import { EmbraceApps } from "../utils/types";
import Discussions from "../components/app/discussions";
import Proposals from "../components/app/proposals";
import Chat from "../components/app/chat";

export const appMappings = {
  [EmbraceApps.DISCUSSIONS]: {
    title: "Discussions",
    route: "discussions",
    component: Discussions,
  },
  [EmbraceApps.PROPOSALS]: {
    title: "Proposals",
    route: "proposals",
    component: Proposals,
  },
  [EmbraceApps.CHAT]: {
    title: "Chat",
    route: "chat",
    component: Chat,
  },
};
