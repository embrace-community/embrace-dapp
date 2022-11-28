import logger from '../HuddleClient/logger';

const sliceAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-5)}`;

export const enumerateMediaDevices = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    logger.error('enumerateDevices() not supported.');
  }

  // List cameras and microphones.
  let devices;

  try {
    devices = await navigator.mediaDevices.enumerateDevices();
  } catch (error) {
    logger.error({ type: 'error', location: 'enumerateDevices()', error });
  }
  return devices || [];
};

export default sliceAddress;

let lastId = 0;

// ditch when using react 18
export const randomId = (prefix = 'id') => {
  lastId += 1;
  return `${prefix}${lastId}`;
};

export const getRandomText = (length: number) => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const isWebsiteLink = (text?: string) => {
  if (!text) return false;
  const regex =
    /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

  const withoutHttp =
    /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

  return regex.test(text) || withoutHttp.test(text);
};

export const hasHttporHttps = (text: string) => {
  if (!text) return false;
  const regex = /^(http|https):\/\//;
  return regex.test(text);
};

const genRanHex = (size: number) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');

export const portalUuid = () => {
  const getHex = genRanHex(16);
  return getHex.toString();
};
