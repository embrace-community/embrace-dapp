import { GetState, SetState } from 'zustand';
import {
  EEnableHostControl,
  EDisableHostControl,
} from '../schema/enums/EHostControlType';

export type StoreSlice<T extends object, E extends object = T> = (
  set: SetState<E extends T ? E : E & T>,
  get: GetState<E extends T ? E : E & T>
) => T;

export enum MediaConsumerTypesEnum {
  cam = 'isCamPaused',
  mic = 'isMicPaused',
  share = 'isShared',
}

export type IDeviceSwitch = 'on' | 'off';

export type MediaConsumerTypes = 'mic' | 'cam' | 'share' | 'shareAudio';

export type Reaction =
  | ''
  | '😂'
  | '😢'
  | '😦'
  | '😍'
  | '🤔'
  | '👀'
  | '🙌'
  | '👍'
  | '👎'
  | '🔥'
  | '🍻'
  | '🚀'
  | '🎉'
  | '❤️'
  | '💯';

export type IPeerState = {
  peerId: string;
  displayName: string;
  avatarUrl: string;
  producers: MediaConsumerTracks;
  consumers?: MediaConsumerTracks;
  isMicPaused: boolean;
  isCamPaused: boolean;
  isSharePaused: boolean;
  isHandRaised: boolean;
  reaction: Reaction;
};

export type IMeInitState = Pick<
  IPeerState,
  'peerId' | 'displayName' | 'avatarUrl'
>;

export type IMeState = Omit<IPeerState, 'consumers'>;

export type IPeerStoreState = Omit<IPeerState, 'producers'>;

export type INewPeerState = Omit<IPeerStoreState, 'consumers'>;

export type IPeerStoreStateKeys = Exclude<keyof IPeerStoreState, 'consumers'>;

export type IMeStoreStateKeys = Exclude<keyof IMeState, 'producers'>;

export interface Recordingfeat {
  state?: null | 'starting' | 'recording' | 'processing';
  recordingUrl?: string;
  ipfsUrl?: string;
}

export type MediaConsumerTracks = Record<
  MediaConsumerTypes,
  MediaConsumer | undefined
>;

export interface MediaConsumer {
  id: string;
  track: MediaStreamTrack;
  isPaused: boolean;
  peerId: string;
  appData: {
    type: MediaConsumerTypes;
    peerId: string;
  };
}

export type GridViewTypes = 'share' | 'grid' | 'spotlight';

export interface IGridState {
  gridView: GridViewTypes;
  screenSharePeerId?: string | null;
  setGridView: (gridView: GridViewTypes, peerId?: string) => void;
  enableScreenShare: (peerId: string) => void;
  disableScreenShare: (gridView: GridViewTypes) => void;
}

export type IPeersState = {
  peers: {
    [peerId: string]: IPeerStoreState;
  };
};

export interface IPeerStoreType extends IPeersState {
  peerCount: number;
  increasePeerCount: (value: number) => void;
  decreasePeerCount: (value: number) => void;
  addPeer: (peerId: string, peer: INewPeerState) => void;
  removePeer: (peerId: string) => void;
  addConsumerMedia: (
    peerId: string,
    consumerType: MediaConsumerTypes,
    consumer: MediaConsumer
  ) => void;
  pauseConsumerMedia: (
    peerId: string,
    consumerType: MediaConsumerTypes
  ) => void;
  resumeConsumerMedia: (
    peerId: string,
    consumerType: MediaConsumerTypes
  ) => void;
  removeConsumerMedia: (
    peerId: string,
    consumerType: MediaConsumerTypes
  ) => void;
  togglePeerHandRaise: (peerId: string, isHandRaised: boolean) => void;
  addReaction: (peerId: string, reaction: Reaction) => void;
  removeReaction: (peerId: string) => void;
  setPeerAvatarUrl: (peerId: string, avatarUrl: string) => void;
}

export const MediaConsumerTypesObj = {
  cam: 'isCamPaused',
  mic: 'isMicPaused',
  share: 'isShared',
};

export interface IMeStoreType extends IMeState {
  initMe: (meInit: IMeInitState) => void;
  setMe: (consumerType: IMeStoreStateKeys, value: any) => void;
  setAvatarUrl: (avatar: string) => void;

  addProducerMedia: (
    producerType: MediaConsumerTypes,
    producer: MediaConsumer
  ) => void;
  removeProducerMedia: (producerType: MediaConsumerTypes) => void;
  updateProducerMedia(
    producerType: MediaConsumerTypes,
    producer: MediaConsumer
  ): void;
  toggleProducerMedia: (
    producerType: MediaConsumerTypes,
    value: IDeviceSwitch
  ) => void;
  toggleMeHandRaise: (isHandRaised: boolean) => void;
  addMeReaction: (reaction: Reaction) => void;
  rmMeReaction: () => void;
}
export interface ILastNStoreType {
  maxViewPortCount: number;
  activeViewPort: number;
  isLastNActive: boolean;
  lastNPeerIds: string[];

  getTotalNumberOfSwaps: (newLastN: string[]) => number;
  setLastNPeerIds: (lastNPeerIds: string[]) => void;
  addPeerToLastN: (peerId: string) => void;
  removePeerFromLastN: (peerId: string) => void;
  activateLastN: () => void;
  deactivateLastN: () => void;
  addActiveViewPort: (value?: number) => void;
  removeActiveViewPort: (value?: number) => void;
}

export interface IRecordingType {
  url: string;
  size: number;
  duration: number;
}

export interface IRecordingStoreType {
  recordingState: {
    inProgress: boolean;
    processing: boolean;
    started: boolean;
  };
  recordings: IRecordingType[];
  newRecording: IRecordingType | null;
  startRecording: () => void;
  toggleRecording: (started: boolean) => void;
  stopRecording: () => void;
  updateRecordings: (recording: IRecordingType) => void;
  setRecordings: (recordings: IRecordingType[]) => void;
  removeNewrecording: () => void;
  endRecording: () => void;
}

// export interface ILiveStreamingStoreType {
//   streamingState: {
//     inProgress: boolean;
//     started: boolean;
//   };
//   streamLink: string;
//   startStreaming: () => void;
//   toggleStreaming: () => void;
//   stopStreaming: () => void;
//   setStreamLink: (streamLink: string) => void;
// }

export type TMediaDevice = {
  deviceId: string;
  label: string;
};
export interface ISpeakerState {
  activeSpeaker: MediaDeviceInfo | null;
  setActiveSpeaker: (activeSpeaker: MediaDeviceInfo) => void;
}

export interface ITestState {
  isTest: boolean;
  toggleIsTest: () => void;
}
export type TNetStats = {
  last_updated: number;
  data: {
    [peerId: string]: number; // stores value from 1 to 4 , 1 indicates poor netwrk, 4 indicates good network
  };
};

export interface INetworkState {
  networkStats: TNetStats;
  bandwidthSaver: boolean;
  setBandwidthSaver: (value: boolean) => void;
  setNetworkStats: (networkStats: TNetStats) => void;
}

export type IMediErrorType =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'SecurityError'
  | 'TypeError'
  | 'UnknownError'
  | string;
export interface IMediaSlice {
  mediaDevice: MediaDeviceInfo | null;
  stream: MediaStream | null;
  streamError: {
    type: IMediErrorType;
    blocked: boolean;
  } | null;
  deviceLoading: boolean;
  streamsArry: MediaStream[];

  enableStream: (
    constraints?: MediaStreamConstraints | undefined
  ) => Promise<void>;
  setMediaDevice: (device: MediaDeviceInfo) => void;
  getMediaDevices: () => Promise<MediaDeviceInfo[]>;
  setMediaStream: (stream: MediaStream | null) => void;
  pauseTracks: () => void;
  switchMediaStream: (stream: MediaStream | null) => void;
  setDeviceLoading: (loading: boolean) => void;
  setStreamError: (error: IMediErrorType) => void;
}
export interface IMicSlice {
  micState: {
    mediaDevice: MediaDeviceInfo | null;
    stream: MediaStream | null;
    streamError: {
      type: IMediErrorType;
      blocked: boolean;
    } | null;
    deviceLoading: boolean;
  };

  enableAudioStream: (
    constraints?: MediaStreamConstraints | undefined
  ) => Promise<void>;
  setAudioDevice: (device: MediaDeviceInfo) => void;
  getAudioDevices: () => Promise<MediaDeviceInfo[]>;
  setAudioStream: (stream: MediaStream | null) => void;
  pauseAudioTracks: () => void;
  switchAudioStream: (stream: MediaStream | null) => void;
  setAudioDeviceLoading: (loading: boolean) => void;
  setAudioStreamError: (error: IMediErrorType) => void;
}
export type IChatType = 'text' | 'file' | 'video' | 'audio';
export type IChatErrorType = Pick<IChatMessage, 'error'>;

export type IChatMessage = {
  id: string;
  peerId: string;
  displayName?: string;
  type: IChatType;
  message?: string;
  timestamp?: string;
  error?: {
    type?: IMediErrorType;
    isError: boolean;
  };
};

export type IChatText = Omit<IChatMessage, 'id'>;

export type TSharedFile = {
  fileName: string;
  fileSize: number;
  ipfsHash: string;
  sharedByPeer: string;
};
export type TNotifSounds = 'chat' | 'peerJoin' | 'peerLeave' | '';
export interface IChatStoreType {
  unread: {
    [chatRoomId: string]: number;
  };
  chat: {
    [chatRoomId: string]: IChatMessage[];
  };
  reactions: {
    [peerId: string]: string;
  };
  sharedFilesArr: Array<TSharedFile>;
  notificationSounds: TNotifSounds;
  chatNotif: boolean;
  peerJoinNotif: boolean;
  peerLeaveNotif: boolean;
  setchatNotif: (value: boolean) => void;
  setpeerJoinNotif: (value: boolean) => void;
  setpeerLeaveNotif: (value: boolean) => void;
  setNotificationSounds: (sounds: TNotifSounds) => void;
  setChat: (chat: IChatText, toId: string, err?: IChatErrorType) => void;
  removeChat: (toId: string) => void;
  increaseUnread: (chatRoomId: string) => void;
  removeUnread: (chatRoomId: string) => void;
  addSharedFile: (file: TSharedFile) => void;
  setSharedFiles: (sharedFiles: TSharedFile[]) => void;
}

export interface ILobbyPeer {
  peerId: string;
  displayName: string;
  avatarUrl?: string;
}
export interface ILobbyPeersStoreType {
  lobbyPeers: ILobbyPeer[];
  addLobbyPeer: (peer: ILobbyPeer) => void;
  setLobbyPeers: (peers: ILobbyPeer[]) => void;
}

export type IDropReason =
  | 'left'
  | 'timeout'
  | 'kicked'
  | 'unhandled'
  | 'not-joined'
  | 'denied'
  | 'closedByHost';

export type IRoomState = {
  roomId: string;
  joined: boolean;
  droppedState: {
    type: IDropReason;
    isDropped: boolean;
  };
  createdAt: number;
  isRoomLocked: boolean;
};

export interface IRoomStateStoreType {
  roomState: IRoomState;
  setRoomLockState: (isRoomLocked: boolean) => void;
  setRoomId: (roomId: string) => void;
  setJoined: () => void;
  setDropState: (dropReason: IDropReason) => void;
  setCreatedAt: (createdAt: number) => void;
}

export interface IFigmentStoreType {
  isFigmentEnabled: boolean;
  figment: {
    figmentType: 'blur' | 'image' | 'video' | 'enable';
    figmentStream: MediaStream | null;
    figmentLoading: boolean;
    figmentstreamError: {
      type: IMediErrorType;
      blocked: boolean;
    } | null;
  };

  setFigmentEnabled: (isFigmentEnabled: boolean) => void;
  toggleFigmentType: (figmentType: 'blur' | 'image' | 'video') => void;
  setFigmentStream: (stream: MediaStream) => void;
  toggleFigmentStream: (
    streamState: 'enable' | 'disable' | 'switch'
  ) => Promise<void>;
  enableFigmentCamStream: (mediaDevice?: MediaDeviceInfo) => Promise<void>;
  disableFigmentStream: () => void;
  setFigmentStreamError: (error: IMediErrorType) => void;
  initFigmentStream: () => Promise<void>;
}
export type IEnableHostControl = {
  [key in EEnableHostControl]: () => void;
};
export type IDisableHostControl = {
  [key in EDisableHostControl]: () => void;
};
export type THostControls = {
  allowVideo: boolean;
  allowAudio: boolean;
  allowScreenShare: boolean;
  allowChat: boolean;
};

export interface IHostControlsStoreType {
  hostId: string | null;
  meId: string;
  coHosts: string[];
  hostControl: THostControls;
  setHost: (hostId: string) => void;
  setCoHosts: (coHosts: string[]) => void;
  setHostControl: (control: THostControls) => void;
  setSingleHostControl: (control: keyof THostControls, val: boolean) => void;
  initHostControls: (
    hostId: string,
    meId: string,
    hostControl: THostControls,
    coHostIds?: string[]
  ) => void;
}

export interface IActiveSpeakerState {
  dominantSpeaker: string;
  peerIdToVolume: Record<string, number>;
  addStreamToHark: (stream: MediaStreamTrack, peerId: string) => void;
  removeStreamFromHark: (peerId: string) => void;
}

export type IStreamingPlatform = 'youtube' | 'livepeer' | 'twitch';

export type IStreamData = {
  url: string;
  isLive: boolean;
  isLoading: boolean;
};

export interface ILiveStream {
  streamData: {
    [key in IStreamingPlatform]?: IStreamData;
  };
  isLiveStreaming: boolean;
  livePlatform: IStreamingPlatform;

  setPlatform: (platform: IStreamingPlatform) => void;
  startStreaming: (platform: IStreamingPlatform) => void;
  stopStreaming: (platform: IStreamingPlatform) => void;
  setStreamData: (
    platform: IStreamingPlatform,
    streamData: IStreamData
  ) => void;
  removeStreamData: (platform: IStreamingPlatform) => void;
}

export type ILayoutSchemaType =
  | 'gridView'
  | 'sideBarGridView'
  | 'sideBarView'
  | 'spotlightView';

export interface ILayoutSlice {
  layout: {
    type: ILayoutSchemaType;
  };

  setLayoutView: (type: ILayoutSchemaType) => void;
}

export type IState = IGridState &
  ILiveStream &
  ITestState &
  IPeerStoreType &
  IMeStoreType &
  ILastNStoreType &
  IRecordingStoreType &
  IMediaSlice &
  IFigmentStoreType &
  IChatStoreType &
  ILobbyPeersStoreType &
  IRoomStateStoreType &
  IHostControlsStoreType &
  INetworkState &
  IHostControlsStoreType &
  IMicSlice &
  ISpeakerState &
  IActiveSpeakerState &
  ILayoutSlice;
