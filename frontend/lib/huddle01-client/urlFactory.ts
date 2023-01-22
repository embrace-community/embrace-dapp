import { ProtooUrlData } from './schema';

interface Hosts {
  [key: string]: string;
}

const hosts: Hosts = {
  'messari.huddle01.com': 'ms-us01.huddle01.com',
  'beta.huddle01.com': 'media-beta.huddle01.com',
  'alpha.huddle01.com': 'media-alpha.huddle01.com',
  'koinx.huddle01.com': 'ms03.huddle01.com',
  // default: 'media-testing.huddle01.com',
  // default: 'ms02.huddle01.com',
  default: 'localhost:4443',
};

export function getProtooUrl({ roomId, peerId, apiKey }: ProtooUrlData) {
  if (apiKey)
    return `wss://sdk.huddle01.com/?roomId=${roomId}&peerId=${peerId}`;

  const hostname = window.location.hostname;

  const mediaServerHostname = hosts[hostname] || hosts.default;

  return `ws://${mediaServerHostname}/?roomId=${roomId}&peerId=${peerId}`;
}
//deploy
