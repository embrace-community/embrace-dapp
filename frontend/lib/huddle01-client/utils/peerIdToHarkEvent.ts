import { Harker } from 'hark';
// Not keeping this in zustand, updating state quite frequently
const peerIdToHark = new Map<string, Harker>();

export default peerIdToHark;
