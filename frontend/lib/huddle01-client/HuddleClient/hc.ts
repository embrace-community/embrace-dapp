import HuddleClient from "./HuddleClient";
import randomString from "random-string";

let hc: HuddleClient;

export const createHuddleClient = (apiKey?: string, isBot = false) => {
  const peerId = isBot ? "recorder_bot" : randomString({ length: 10 });
  hc = new HuddleClient(peerId, isBot, apiKey);
  return hc;
};

export const getHuddleClient = (apiKey?: string, isBot = false) => {
  if (!hc) createHuddleClient(apiKey, isBot);

  return hc;
};
