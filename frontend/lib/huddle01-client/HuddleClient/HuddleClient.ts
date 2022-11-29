// lib
import { types as mediasoupTypes, Device } from "mediasoup-client";
import protooClient from "protoo-client";
import axios from "axios";

//utils
import logger from "./logger";
import { getProtooUrl } from "../urlFactory";
import {
  PC_PROPRIETARY_CONSTRAINTS,
  WEBCAM_SIMULCAST_ENCODINGS,
} from "../constants";
import {
  GetHuddleStoreType,
  GetPortStoreType,
  LastNData,
  NotifMethods,
  ProtooUrlData,
  // Recordingfeat,
  RequestMethods,
  TLiveStreamObject,
  TWalletData,
} from "../schema";
import {
  IChatText,
  IDeviceSwitch,
  IDropReason,
  IEnableHostControl,
  IDisableHostControl,
  ILobbyPeer,
  IMeInitState,
  INewPeerState,
  MediaConsumerTypes,
  MediaConsumerTypesObj,
  THostControls,
  Reaction,
  GridViewTypes,
  TNetStats,
  IRecordingType,
  TSharedFile,
  TNotifSounds,
  IStreamingPlatform,
  IStreamData,
  ILayoutSchemaType,
  MediaConsumer,
} from "../store/storeTypes";
import {
  EEnableHostControl,
  EDisableHostControl,
} from "../schema/enums/EHostControlType";
import { disableFigment } from "../utils/figment";
import { triggerIframeEvent } from "../Iframe";
import getDeviceType from "../utils/getDeviceType";
import { now } from "../utils/dateHandler";

let getHuddleStore: GetHuddleStoreType;
let getPortStore: GetPortStoreType;

export class HuddleStore {
  static initPort(get: GetPortStoreType) {
    getPortStore = get;
  }

  addPeerPort(peerId: string) {
    const { addPeerPort } = getPortStore();
    addPeerPort(peerId);
  }

  removePeerPort(peerId: string) {
    logger.info(`Removing peer Audio port ${peerId}`);
    const { removePeerPort } = getPortStore();
    removePeerPort(peerId);
  }

  static init(get: GetHuddleStoreType) {
    getHuddleStore = get;
  }

  getProducerState(producerType: MediaConsumerTypes): boolean {
    const mediaState = MediaConsumerTypesObj[producerType];
    return getHuddleStore()[mediaState];
  }

  getAvatarUrl() {
    const { avatarUrl } = getHuddleStore();
    return avatarUrl;
  }

  getCamStream() {
    const { stream } = getHuddleStore();
    return stream;
  }

  getMicStream() {
    const { stream } = getHuddleStore().micState;
    return stream;
  }

  getDisplayName() {
    const { displayName } = getHuddleStore();
    return displayName;
  }

  getPeerDisplayName(peerId: string) {
    const { peers } = getHuddleStore();
    return peers[peerId]?.displayName;
  }

  getParticipants() {
    const { peers } = getHuddleStore();
    return peers;
  }

  getJoinedState() {
    const {
      roomState: { joined },
    } = getHuddleStore();
    return joined;
  }

  async enableMicStream() {
    const { enableAudioStream } = getHuddleStore();
    await enableAudioStream();
  }

  async enableCamStream() {
    const { enableStream } = getHuddleStore();
    await enableStream();
  }

  disableMicStream() {
    const { pauseAudioTracks } = getHuddleStore();
    pauseAudioTracks();
  }

  disableCamStream() {
    const { pauseTracks } = getHuddleStore();
    pauseTracks();
  }

  toggleFigmentStream(toggle: "enable" | "disable" | "switch") {
    const { toggleFigmentStream } = getHuddleStore();
    toggleFigmentStream(toggle);
  }
  changePeerAvatarUrl(peerId: string, avatarUrl: string) {
    const { setPeerAvatarUrl } = getHuddleStore();
    setPeerAvatarUrl(peerId, avatarUrl);
  }

  setMeAvatarUrl(avatarUrl: string) {
    const { setAvatarUrl } = getHuddleStore();
    setAvatarUrl(avatarUrl);
  }

  initMe(meInit: IMeInitState) {
    const { initMe } = getHuddleStore();
    initMe(meInit);
  }

  addProducerMedia(producerType: MediaConsumerTypes, producer: MediaConsumer) {
    const { addProducerMedia } = getHuddleStore();
    addProducerMedia(producerType, producer);
  }

  removeProducerMedia(producerType: MediaConsumerTypes) {
    const { removeProducerMedia } = getHuddleStore();
    logger.info("removed producer cam");
    removeProducerMedia(producerType);
  }

  updateProducerMedia(
    producerType: MediaConsumerTypes,
    producer: MediaConsumer,
  ) {
    const { updateProducerMedia } = getHuddleStore();
    updateProducerMedia(producerType, producer);
  }

  toggleProducerMedia(producerType: MediaConsumerTypes, value: IDeviceSwitch) {
    const { toggleProducerMedia } = getHuddleStore();
    toggleProducerMedia(producerType, value);
  }

  addPeer(peerId: string, peer: INewPeerState) {
    const { addPeer } = getHuddleStore();
    addPeer(peerId, peer);
  }

  removePeer(peerId: string) {
    const { removePeer } = getHuddleStore();
    removePeer(peerId);
  }

  peerExists(peerId: string) {
    const { peers } = getHuddleStore();
    return !!peers[peerId];
  }

  getPeerIds() {
    const { peers } = getHuddleStore();
    return Object.keys(peers);
  }

  addConsumerMedia(
    peerId: string,
    consumerType: MediaConsumerTypes,
    consumer: MediaConsumer,
  ) {
    const { addConsumerMedia } = getHuddleStore();
    addConsumerMedia(peerId, consumerType, consumer);
  }

  removeConsumerMedia(peerId: string, consumerType: MediaConsumerTypes) {
    const { removeConsumerMedia } = getHuddleStore();
    removeConsumerMedia(peerId, consumerType);
  }

  pauseConsumerMedia(peerId: string, consumerType: MediaConsumerTypes) {
    const { pauseConsumerMedia } = getHuddleStore();
    pauseConsumerMedia(peerId, consumerType);
  }

  resumeConsumerMedia(peerId: string, consumerType: MediaConsumerTypes) {
    const { resumeConsumerMedia } = getHuddleStore();
    resumeConsumerMedia(peerId, consumerType);
  }

  updateProducer(producerType: MediaConsumerTypes, value: any) {
    logger.info({ producerType, value });
  }

  enableScreenShare(peerId: string) {
    const { enableScreenShare } = getHuddleStore();
    enableScreenShare(peerId);
  }

  disableScreenShare(gridView: GridViewTypes) {
    const { disableScreenShare } = getHuddleStore();
    disableScreenShare(gridView);
  }
  setNetworkStats(stats: TNetStats) {
    const { setNetworkStats } = getHuddleStore();
    setNetworkStats(stats);
  }

  setTest() {
    const { toggleIsTest } = getHuddleStore();
    toggleIsTest();
  }

  toggleRecording(started: boolean) {
    const { toggleRecording } = getHuddleStore();
    toggleRecording(started);
  }

  setChat(message: string, toId: string, fromId: string, timestamp: string) {
    const { setChat } = getHuddleStore();
    const chats: IChatText = {
      peerId: fromId,
      displayName: this.getPeerDisplayName(fromId) || this.getDisplayName(),
      type: "text",
      timestamp,
      message,
    };
    setChat(chats, toId);
  }

  togglePeerHandRaise(peerId: string, isHandRaised: boolean) {
    const { togglePeerHandRaise } = getHuddleStore();
    togglePeerHandRaise(peerId, isHandRaised);
  }

  toggleMeHandRaise(isHandRaised: boolean) {
    const { toggleMeHandRaise } = getHuddleStore();
    toggleMeHandRaise(isHandRaised);
  }

  addReaction(peerId: string, reaction: Reaction) {
    const { addReaction } = getHuddleStore();
    addReaction(peerId, reaction);
  }

  addMeReaction(reaction: Reaction) {
    const { addMeReaction } = getHuddleStore();
    addMeReaction(reaction);
  }

  addLobbyPeer(peers: ILobbyPeer[]) {
    const { setLobbyPeers } = getHuddleStore();
    setLobbyPeers(peers);
  }

  setDropState(dropReason: IDropReason) {
    const { setDropState } = getHuddleStore();
    setDropState(dropReason);
  }

  setJoined() {
    const { setJoined } = getHuddleStore();
    setJoined();
  }

  setRoomId(roomId: string) {
    const { setRoomId } = getHuddleStore();
    setRoomId(roomId);
  }

  setCreatedAt(createdAt: number) {
    const { setCreatedAt } = getHuddleStore();
    setCreatedAt(createdAt);
  }

  removeChat(peerId: string) {
    const { removeChat } = getHuddleStore();
    removeChat(peerId);
  }

  increaseUnread(peerId: string) {
    const { increaseUnread } = getHuddleStore();
    increaseUnread(peerId);
  }

  removeUnread(peerId: string) {
    const { removeUnread } = getHuddleStore();
    removeUnread(peerId);
  }

  addSharedFile(sharedFile: TSharedFile) {
    const { addSharedFile } = getHuddleStore();
    addSharedFile(sharedFile);
  }

  setSharedFiles(sharedFiles: TSharedFile[]) {
    const { setSharedFiles } = getHuddleStore();
    setSharedFiles(sharedFiles);
  }
  isMicPaused() {
    const { isMicPaused } = getHuddleStore();
    return isMicPaused;
  }

  initHostControls(
    hostId: string,
    meId: string,
    hostControls: THostControls,
    coHostIds: string[] | undefined,
  ) {
    const { initHostControls } = getHuddleStore();
    initHostControls(hostId, meId, hostControls, coHostIds);
  }

  setSingleHostControl(control: keyof THostControls, val: boolean) {
    const { setSingleHostControl } = getHuddleStore();
    setSingleHostControl(control, val);
  }

  setHost(hostId: string) {
    const { setHost } = getHuddleStore();
    setHost(hostId);
  }
  setCoHosts(coHostIds: string[]) {
    const { setCoHosts } = getHuddleStore();
    setCoHosts(coHostIds);
  }

  increasePeerCount(value: number = 1) {
    const { increasePeerCount } = getHuddleStore();
    increasePeerCount(value);
  }

  decreasePeerCount(value: number = 1) {
    const { decreasePeerCount } = getHuddleStore();
    decreasePeerCount(value);
  }

  setStartRecording() {
    const { startRecording } = getHuddleStore();
    startRecording();
  }

  setStopRecording() {
    const { stopRecording } = getHuddleStore();
    stopRecording();
  }

  setMediaDevice(mediaDevice: MediaDeviceInfo) {
    const { setMediaDevice } = getHuddleStore();
    setMediaDevice(mediaDevice);
  }

  setAudioDevice(audioDevice: MediaDeviceInfo) {
    const { setAudioDevice } = getHuddleStore();
    setAudioDevice(audioDevice);
  }

  recordingStatus() {
    const { inProgress } = getHuddleStore().recordingState;
    return inProgress;
  }

  updateRecording(recording: IRecordingType) {
    const { updateRecordings } = getHuddleStore();
    updateRecordings(recording);
  }

  setRecordings(recordings: IRecordingType[]) {
    const { setRecordings } = getHuddleStore();
    setRecordings(recordings);
  }

  setRecordingEnded() {
    const { endRecording } = getHuddleStore();
    endRecording();
  }

  // LastN Handlers;
  getIsRoomJoined() {
    const { roomState } = getHuddleStore();
    return roomState.joined;
  }

  getMaxViewPortCount() {
    const { maxViewPortCount } = getPortStore();
    return maxViewPortCount;
  }

  getActiveViewPort() {
    const { activeViewPort } = getHuddleStore();
    return activeViewPort;
  }

  getLastNActive() {
    const { isLastNActive } = getHuddleStore();
    return isLastNActive;
  }

  getLastNPeerIds() {
    const { lastNPeerIds } = getHuddleStore();
    return lastNPeerIds;
  }

  getSpaceLeftInLastN() {
    const lastNPeerIds = this.getLastNPeerIds();
    return this.getMaxViewPortCount() - lastNPeerIds.length;
  }

  setNotificationSounds(sounds: TNotifSounds) {
    const { setNotificationSounds } = getHuddleStore();
    setNotificationSounds(sounds);
  }

  setLastNPeerIds(peerIds: string[]) {
    const { setLastNPeerIds } = getHuddleStore();
    setLastNPeerIds(peerIds);
  }

  setLastNForNewPeerJoined() {
    if (this.getIsRoomJoined()) {
      logger.error({
        type: "error",
        message:
          "setLastNForNewPeerJoined() | Already Joined Room cannot set again",
        meta: {
          isJoined: this.getIsRoomJoined(),
        },
      });

      return;
    }

    const peerIds = this.getPeerIds().slice(0, this.getMaxViewPortCount());

    this.setLastNPeerIds(peerIds);

    this.addActiveViewPort(peerIds.length);

    logger.info({
      logType: "setLastNForNewPeerJoined",
      message: "** Setting LastN for New Peer that Joined **",
      meta: {
        peerIds,
        lastN: this.getLastNPeerIds(),
      },
    });
  }

  setRoomLockState(isRoomLocked: boolean) {
    const { setRoomLockState } = getHuddleStore();
    setRoomLockState(isRoomLocked);
  }
  getRoomLockState() {
    const { isRoomLocked } = getHuddleStore().roomState;
    return isRoomLocked;
  }

  addMissingPeerToLastN() {
    const { lastNPeerIds } = getHuddleStore();
    const missingPeerToLastN = this.getPeerIds().filter(
      (peerId) => !lastNPeerIds.includes(peerId),
    )[0];
    if (missingPeerToLastN) {
      logger.info({
        logType: "addAllPeersToLastN",
        meta: { missingPeerToLastN },
        message:
          "This peer is not in lastNPeerIds, so we add it to lastNPeerIds",
      });
      this.addPeerToLastN(missingPeerToLastN);
    }
  }

  addPeerToLastN(peerId: string) {
    const { addPeerToLastN } = getHuddleStore();
    addPeerToLastN(peerId);
  }

  removePeerFromLastN(peerId: string) {
    const { removePeerFromLastN } = getHuddleStore();
    removePeerFromLastN(peerId);
  }

  addActiveViewPort(value: number = 1) {
    const { addActiveViewPort } = getHuddleStore();
    addActiveViewPort(value);
  }

  removeActiveViewPort(value: number = 1) {
    const { removeActiveViewPort } = getHuddleStore();
    removeActiveViewPort(value);
  }

  addStreamToHark(stream: MediaStreamTrack, peerId: string) {
    const { addStreamToHark } = getHuddleStore();
    addStreamToHark(stream, peerId);
  }

  removeStreamFromHark(peerId: string) {
    const { removeStreamFromHark } = getHuddleStore();
    removeStreamFromHark(peerId);
  }

  async disableAllCamStreams() {
    this.disableCamStream();
    this.toggleFigmentStream("disable");
    await disableFigment();
  }

  // Viewport Handlers;
  getActiveViewPortIds() {
    const { activeViewPortIds } = getPortStore();
    return activeViewPortIds;
  }

  getSpaceLeftInViewport() {
    const { getSpaceLeftInViewport } = getPortStore();
    return getSpaceLeftInViewport();
  }

  setActiveViewPort(activeViewPortIds: string[]) {
    const { setActiveViewPort } = getPortStore();
    setActiveViewPort(activeViewPortIds);
  }

  addPeerViewPort(peerId: string) {
    const { addPeerViewPort } = getPortStore();
    addPeerViewPort(peerId);
  }

  removePeerViewPort(peerId: string) {
    const { removePeerViewPort } = getPortStore();
    removePeerViewPort(peerId);
  }

  isLastNActive() {
    const { isLastNActive } = getPortStore();
    return isLastNActive;
  }

  activateLastN() {
    const { activateLastN } = getPortStore();
    activateLastN();
  }

  deactivateLastN() {
    const { deactivateLastN } = getPortStore();
    const { peers } = getHuddleStore();

    const activeViewPorts = this.getActiveViewPortIds();
    const numOfViewPorts = activeViewPorts.size;

    Array.from(activeViewPorts).forEach((peerId) => {
      if (!peers[peerId]) {
        logger.warn({
          logType: "deactivateLastN",
          message: "Peer not found in peers | Removing from activeViewPorts",
          meta: {
            peerId,
          },
        });

        this.removePeerViewPort(peerId);
      }

      if (
        numOfViewPorts === this.getMaxViewPortCount() - 1 &&
        !activeViewPorts.has(peerId) &&
        peers[peerId]
      ) {
        logger.warn({
          logType: "deactivateLastN",
          message:
            "Peer not found in activeViewPorts | Adding to activeViewPorts",
          meta: {
            peerId,
          },
        });
        this.addPeerViewPort(peerId);
      }
    });

    deactivateLastN();
  }

  setActiveViewPortForNewPeer() {
    if (this.getIsRoomJoined()) {
      logger.error({
        type: "error",
        message:
          "setLastNForNewPeerJoined() | Already Joined Room cannot set again",
        meta: {
          isJoined: this.getIsRoomJoined(),
        },
      });

      return;
    }
    const activateLast = this.getPeerIds().length > this.getMaxViewPortCount();
    const peerIds = this.getPeerIds().slice(0, this.getMaxViewPortCount());

    this.setActiveViewPort(peerIds);
    if (activateLast) this.activateLastN();
  }

  // Streaming Handlers;
  startStreaming(platform: IStreamingPlatform) {
    const { startStreaming } = getHuddleStore();
    startStreaming(platform);
  }

  setStreamPlatform(platform: IStreamingPlatform) {
    const { setPlatform } = getHuddleStore();
    setPlatform(platform);
  }

  stopStreaming(platform: IStreamingPlatform) {
    const { stopStreaming } = getHuddleStore();
    stopStreaming(platform);
  }

  setStreamData(platform: IStreamingPlatform, streamData: IStreamData) {
    const { setStreamData } = getHuddleStore();
    setStreamData(platform, streamData);
  }

  // handle screen share change
  setLayoutView(type: ILayoutSchemaType) {
    const { setLayoutView } = getHuddleStore();

    setLayoutView(type);
  }

  getLayout() {
    const { layout } = getHuddleStore();

    return layout;
  }

  setScreenShareLayout(isBot = false, viewType: ILayoutSchemaType) {
    const numOfPeersToSwitchView = isBot ? 3 : 2;
    if (this.getPeerIds().length === numOfPeersToSwitchView) {
      this.setLayoutView(viewType);
    }
  }
  getBandwidthSaver() {
    const { bandwidthSaver } = getHuddleStore();
    return bandwidthSaver;
  }
}

class RoomSocketClient extends HuddleStore {
  socket: null | protooClient.Peer;
  apiKey: string | undefined;

  constructor(apiKey: ProtooUrlData["apiKey"]) {
    super();

    this.socket = null;
    this.apiKey = apiKey;
  }

  getSocket(roomId: string, peerId: string) {
    const protooUrl = getProtooUrl({
      roomId: roomId,
      peerId: peerId,
      apiKey: this.apiKey,
    });

    const protooTransport = new protooClient.WebSocketTransport(protooUrl);

    const socket = new protooClient.Peer(protooTransport);

    return socket;
  }

  setSocket(roomId: string, peerId: string) {
    const protooUrl = getProtooUrl({
      roomId: roomId,
      peerId: peerId,
      apiKey: this.apiKey,
    });

    const protooTransport = new protooClient.WebSocketTransport(protooUrl);

    this.socket = new protooClient.Peer(protooTransport);

    logger.info({ type: "info", message: "setSocket", socket: this.socket });
  }

  async startRecording() {
    if (!this.socket) return;
    if (this.recordingStatus()) return;

    try {
      this.setStartRecording();
      await this.socket.request("startRecording");
    } catch (error) {
      logger.error({ type: "error", message: "startRecording", error });
      throw new Error("Error starting recording");
    }
  }

  async stopRecording() {
    if (!this.socket) return;
    if (!this.recordingStatus()) return;

    try {
      await this.socket.request("stopRecording");
      this.setStopRecording();
    } catch (error) {
      logger.error({ type: "error", message: "stopRecording", error });
    }
  }

  async startLiveStreaming(
    platform: IStreamingPlatform,
    streamObj?: TLiveStreamObject,
  ) {
    if (!this.socket) return;

    try {
      this.startStreaming(platform);
      if (streamObj) {
        await this.socket.request("startStreaming", {
          platform: platform,
          rtmpEndpoint: `${streamObj.streamLink}/${streamObj.streamKey}`,
        });
      } else await this.socket.request("startStreaming", { platform });

      logger.info({
        streamObj,
      });
    } catch (error) {
      logger.error({ type: "error", message: "startStreaming", error });
      throw new Error("Error while starting streamer");
    }
  }

  async stopLiveStreaming(platform: IStreamingPlatform) {
    if (!this.socket) return;

    try {
      this.stopStreaming(platform);
      await this.socket.request("stopStreaming");
    } catch (error) {
      logger.error({ type: "error", message: "stopStreaming", error });
    }
  }

  async newSharedFile(fileDetails: any) {
    if (!this.socket) return;

    try {
      await this.socket.request("sendData", {
        type: "sharedFile",
        payload: fileDetails,
      });
    } catch (error) {
      logger.error({ type: "error", message: "stopStreaming", error });
    }
  }
}

class RoomMediasoupClient extends RoomSocketClient {
  mediasoupDevice: null | Device;
  sendTransport: null | mediasoupTypes.Transport;
  recvTransport: null | mediasoupTypes.Transport;
  consumers: Map<string, mediasoupTypes.Consumer> = new Map();
  _turn: RTCIceServer[] = [];

  constructor(apiKey: ProtooUrlData["apiKey"]) {
    super(apiKey);
    this.mediasoupDevice = null;
    this.sendTransport = null;
    this.recvTransport = null;
  }

  async createMediasoupTransport(producing: boolean, consuming: boolean) {
    if (!this.mediasoupDevice || !this.socket) return;

    const transportInfo = await this.socket.request("createWebRtcTransport", {
      producing,
      consuming,
      sctpCapabilities: this.mediasoupDevice.sctpCapabilities,
    });
    return transportInfo;
  }

  async createSendTransport() {
    if (!this.mediasoupDevice || !this.socket) return;

    const transportInfo = await this.createMediasoupTransport(true, false);

    const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
      transportInfo;

    this.sendTransport = this.mediasoupDevice.createSendTransport({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers: this._turn,
      proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS,
    });

    this.sendTransport.on(
      "connect",
      ({ dtlsParameters }, callback, errback) => {
        this.socket
          ?.request("connectWebRtcTransport", {
            transportId: this.sendTransport?.id,
            dtlsParameters,
          })
          .then(callback)
          .catch(errback);
      },
    );

    this.sendTransport.on(
      "produce",
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { id } = await this.socket?.request("produce", {
            transportId: this.sendTransport?.id,
            kind,
            rtpParameters,
            appData,
            paused: appData.type === "mic" ? this.isMicPaused() : false,
          });

          callback({ id });
        } catch (error: any) {
          errback(error);
        }
      },
    );

    this.sendTransport.on(
      "producedata",
      async (
        { sctpStreamParameters, label, protocol, appData },
        callback,
        errback,
      ) => {
        try {
          const { id } = await this.socket?.request("produceData", {
            transportId: this.sendTransport?.id,
            sctpStreamParameters,
            label,
            protocol,
            appData,
          });

          callback({ id });
        } catch (error: any) {
          errback(error);
        }
      },
    );
  }

  async createRecvTransport() {
    if (!this.mediasoupDevice || !this.socket) return;

    const transportInfo = await this.createMediasoupTransport(false, true);

    const { id, iceParameters, iceCandidates, dtlsParameters, sctpParameters } =
      transportInfo;

    this.recvTransport = this.mediasoupDevice.createRecvTransport({
      id,
      iceParameters,
      iceCandidates,
      dtlsParameters,
      sctpParameters,
      iceServers: this._turn,
    });

    this.recvTransport.on(
      "connect",
      (
        { dtlsParameters },
        callback,
        errback, // eslint-disable-line no-shadow
      ) => {
        this.socket
          ?.request("connectWebRtcTransport", {
            transportId: this.recvTransport?.id,
            dtlsParameters,
          })
          .then(callback)
          .catch(errback);
      },
    );
  }

  async loadMediasoupDevice() {
    if (!this.socket) return;

    this.mediasoupDevice = new Device();

    const routerRtpCapabilities = await this.socket.request(
      "getRouterRtpCapabilities",
    );

    await this.mediasoupDevice.load({ routerRtpCapabilities });
    logger.info("mediasoupDevice loaded");

    // Check whether we can produce video to the router.
    if (!this.mediasoupDevice.canProduce("video")) {
      logger.warn("cannot produce video");

      // TODO: Abort next steps.
    }
  }
}

export default class HuddleClient extends RoomMediasoupClient {
  roomId: string | null;
  hostId: string | null;
  peerId: string;
  produce: boolean;
  _webcamProducer: null | mediasoupTypes.Producer;
  _shareVideoProducer: null | mediasoupTypes.Producer;
  _shareAudioProducer: null | mediasoupTypes.Producer;
  micProducer: null | mediasoupTypes.Producer;
  _loading: boolean;
  _chatDataProducer: null | mediasoupTypes.DataProducer;
  _useDataChannel: boolean;
  _bot: boolean;
  joining: boolean = false;

  constructor(peerId: string, isBot: boolean, apiKey?: string) {
    super(apiKey);

    this.roomId = null;
    this.hostId = null;
    this.peerId = peerId;
    this.produce = true;
    this._webcamProducer = null;
    this._shareVideoProducer = null;
    this._shareAudioProducer = null;
    this.micProducer = null;
    this._loading = false;
    this._chatDataProducer = null;
    this._useDataChannel = true;
    this._bot = isBot;
  }

  get isBot() {
    return this._bot;
  }

  async changeAvatarUrl(avatarUrl: string) {
    if (!this.socket)
      return logger.error({
        type: "error",
        message: "changeAvatarUrl",
        error: "no socket",
      });

    try {
      this.setMeAvatarUrl(avatarUrl);
      await this.socket.request("changeAvatarUrl", { avatarUrl });
    } catch (error) {
      console.error(error);
    }
  }

  async sendDM(message: string, toId: string, fromId: string) {
    try {
      await this.socket?.request("sendData", {
        type: "dm",
        payload: { message, toId, fromId, timestamp: now() },
      });
    } catch (error) {
      console.error(error);
    }
  }
  async toggleRaiseHand(isHandRaised: boolean) {
    try {
      await this.socket?.request("sendData", {
        type: "raiseHand",
        payload: { isHandRaised },
      });
      this.toggleMeHandRaise(isHandRaised);
    } catch (error) {
      console.error(error);
    }
  }
  async sendReaction(reaction: Reaction) {
    try {
      await this.socket?.request("sendData", {
        type: "reaction",
        payload: { reaction },
      });
      this.addMeReaction(reaction);
    } catch (error) {
      console.error(error);
    }
  }

  async allowLobbyPeerToJoinRoom(peerIdToAdmit: string) {
    if (!this.socket) return;

    this.socket.request("allowRoomJoin", { peerIdToAdmit });
  }

  async allowAllLobbyPeersToJoinRoom() {
    if (!this.socket) return;

    this.socket.request("admitAll");
  }

  async disallowLobbyPeerFromJoiningRoom(peerIdToDisallow: string) {
    if (!this.socket) return;

    this.socket.request("disallowRoomJoin", {
      peerIdToDisallow,
    });
  }

  async disallowAllLobbyPeerFromJoiningRoom() {
    if (!this.socket) return;

    this.socket.request("denyAll");
  }

  async requestLobby(
    displayName: string,
    avatarUrl: string,
    walletData: TWalletData,
  ) {
    if (!this.socket) return logger.error({ type: "error", msg: "no socket" });

    const { host } = await this.socket.request("lobby", {
      displayName,
      avatarUrl,
      walletData,
    });

    logger.info({
      type: "info",
      msg: "requestLobby()",
      data: { host, meId: this.peerId },
    });

    this.hostId = host;
  }

  async join(roomId: string, walletData: TWalletData) {
    if (this.joining) return;
    this.joining = true;
    this.setSocket(roomId, this.peerId);

    if (!this.socket)
      return logger.error({ type: "error", msg: "join() no socket" });

    this.socket.on("open", async () => {
      logger.info({ type: "info", msg: "socket open" });

      const avatarUrl = this.getAvatarUrl();

      await this.requestLobby(this.getDisplayName(), avatarUrl, walletData);

      this.initMe({
        peerId: this.peerId,
        displayName: this.getDisplayName(),
        avatarUrl,
      });
      this.roomId = roomId;
    });

    // TODO: can utilize this for reconnection wen we change internet connection or user drop for few seconds.
    // This can be achieved my maintaining a recoonection state and updating UI according to it
    this.socket.on("failed", () => {
      logger.info({
        type: "error",
        text: "WebSocket connection failed",
      });
      this.joining = false;
    });

    this.socket.on("disconnected", () => {
      logger.info({
        type: "error",
        text: "WebSocket  disconnected",
      });
      this.joining = false;
    });

    this.socket.on("close", () => {
      logger.info({ type: "error", text: "WebSocket  closed" });
      // TODO: Close mediasoup transports
      // TODO: Close Cam and Mic Stream;
      this.recvTransport?.close();
      this.sendTransport?.close();
      this.disableCamStream();
      this.joining = false;
    });

    this.socket.on("request", async (request, accept, _reject) => {
      this.joining = false;
      const promises: Promise<void>[] = [];
      const requestMethods: RequestMethods = {
        newConsumer: async () => {
          logger.info({ type: "info", msg: "newConsumer", data: request.data });

          const {
            peerId,
            producerId,
            id,
            kind,
            rtpParameters,
            // type,
            appData,
            producerPaused,
          } = request.data;

          if (!this.recvTransport) return;

          try {
            const consumer = await this.recvTransport.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              appData: { ...appData, peerId }, // Trick.
            });

            // Store in the map.
            this.consumers.set(consumer.id, consumer);

            consumer.on("transportclose", () => {
              logger.info({
                type: "info",
                msg: "consumer transport closed",
                data: {
                  consumerId: consumer.id,
                  peerId: consumer.appData?.peerId,
                },
              });
              // TODO: should also remove from the zustand store;
              this.consumers.delete(consumer.id);
              this.removeStreamFromHark(peerId);
            });

            const consumerToAdd: MediaConsumer = {
              id: consumer.id,
              track: consumer.track,
              isPaused: producerPaused,
              peerId,
              appData,
            };

            this.addConsumerMedia(peerId, appData.type, consumerToAdd);

            if (appData.type === "mic") {
              if (consumerToAdd.isPaused) {
                this.pauseConsumerMedia(peerId, appData.type);
              } else this.addStreamToHark(consumer.track, peerId);
            }

            if (appData.type === "share") {
              logger.info({
                type: "info",
                msg: "newConsumer | Screen Share Enabled",
                peerId,
              });
              this.enableScreenShare(peerId);
            }
            if (appData.type === "shareAudio") {
              logger.info({
                type: "info",
                msg: "newConsumer | Screenshare Audio Share Enabled",
                peerId,
              });
            }
            accept();

            if (appData.type === "cam" && this.getBandwidthSaver()) {
              promises.push(this.pauseConsumer(id, peerId, "cam"));
            }
          } catch (error) {
            logger.error({ type: error, error });
            promises.splice(0, promises.length);
          }
        },
      };

      await requestMethods[request.method]?.();
      await Promise.all(promises);
    });

    this.socket.on("notification", (notification) => {
      this.joining = false;
      const notifMethods: NotifMethods = {
        peerAvatarUrlChanged: () => {
          logger.info({ type: "info", msg: "peerAvatarUrlChanged" });
          const { peerId, avatarUrl } = notification.data;

          // * iframeApi
          triggerIframeEvent("avatar-url-changed", {
            peerId,
            avatarUrl,
          });

          this.changePeerAvatarUrl(peerId, avatarUrl);
        },

        joinRoomPermissionGranted: () => {
          logger.info({ type: "info", msg: "joinRoomPermissionGranted" });
          this.joinRoom();
        },

        joinRoomPermissionDenied: () => {
          this.close("denied");
          logger.info({ type: "info", msg: "joinRoomPermissionDenied" });
        },

        roomClosedByHost: () => {
          this.close("closedByHost");
          logger.info({ type: "info", msg: "roomClosedByHost" });
        },
        kickedByHost: () => {
          this.close("kicked");
          logger.info({ type: "info", msg: "kickedByHost" });
        },

        newLobbyPeer: () => {
          const data = notification.data;
          this.addLobbyPeer(data.lobbyPeers);

          logger.info({
            type: "info",
            msg: "newLobbyPeer",
            data: notification.data,
          });
        },

        newPeer: () => {
          const peer = notification.data;

          if (peer.id === "recorder_bot") {
            logger.info({
              type: "info",
              message: "Recorder Bot has entered the room...",
              meta: {
                peerId: peer.id,
              },
            });

            return;
          }

          const newPeer: INewPeerState = {
            peerId: peer.id,
            displayName: peer.displayName,
            avatarUrl: peer.avatarUrl,
            isMicPaused: true,
            isCamPaused: true,
            isSharePaused: true,
            isHandRaised: false,
            reaction: peer.reaction,
          };

          // * iframe api
          triggerIframeEvent("peer-join", newPeer);

          this.setScreenShareLayout(this.isBot, "sideBarGridView");

          this.addPeer(peer.id, newPeer);

          this.addPeerPort(peer.id);

          if (this.getSpaceLeftInViewport() > 0) this.addPeerViewPort(peer.id);

          logger.info({
            type: "info",
            msg: "newPeer",
            data: notification.data,
          });

          this.setNotificationSounds("peerJoin");
        },

        peerClosed: () => {
          const { peerId } = notification.data;

          if (peerId === "recorder_bot") return;

          this.removeChat(peerId);
          this.removePeerViewPort(peerId);

          if (this.getSpaceLeftInViewport() > 0 && this.isLastNActive()) {
            this.deactivateLastN();
          }

          this.removePeerPort(peerId);

          this.removePeer(peerId);

          this.setScreenShareLayout(this.isBot, "sideBarView");

          triggerIframeEvent("peer-left", { peerId });

          logger.info({
            type: "info",
            msg: "peerClosed",
            data: notification.data,
          });
          this.setNotificationSounds("peerLeave");

          this.removeStreamFromHark(peerId);
        },
        updatedPeersArray: () => {
          const data = notification.data;
          this.addLobbyPeer(data.lobbyPeers);

          logger.info({
            type: "info",
            msg: "updatedPeersArray",
            data: notification.data,
          });
        },
        consumerClosed: () => {
          const { consumerId } = notification.data;
          const consumer = this.consumers.get(consumerId);
          logger.info({ type: "info", msg: "consumerClosed", consumer });
          if (!consumer) return;
          const {
            appData: { type, peerId },
          } = consumer;

          if (type === "share") {
            logger.info({
              type: "info",
              msg: "newConsumer | Screen Share Disabled",
              peerId,
            });
            this.disableScreenShare("grid");
          }

          if (type === "mic") this.removeStreamFromHark(peerId as string);

          consumer.close();
          this.consumers.delete(consumerId);

          this.removeConsumerMedia(
            peerId as string,
            type as MediaConsumerTypes,
          );
        },
        consumerPaused: () => {
          const { consumerId } = notification.data;

          const consumer = this.consumers.get(consumerId);
          if (!consumer) return;
          const {
            appData: { type, peerId },
          } = consumer;
          logger.info({ type: "info", msg: "consumerPaused", consumer });

          consumer.pause();

          if (type === "mic") {
            this.pauseConsumerMedia(peerId as string, type);
            this.removeStreamFromHark(peerId as string);
          }
        },
        consumerResumed: () => {
          const { consumerId } = notification.data;
          const consumer = this.consumers.get(consumerId);
          if (!consumer) return;
          const {
            appData: { type, peerId },
          } = consumer;
          logger.info({ type: "info", msg: "consumerResumed", consumer });

          consumer.resume();

          if (type === "mic") {
            this.resumeConsumerMedia(peerId as string, type);
            this.addStreamToHark(consumer.track, peerId as string);
          }
        },
        "recording-started": () => {
          this.setStartRecording();
          this.toggleRecording(true);
          logger.info({ type: "info", msg: "recording-started" });
        },
        "recording-stopped": () => {
          this.setStopRecording();
          this.toggleRecording(false);
          logger.info({ type: "info", msg: "recording-stopped" });
        },
        recordingUrl: () => {
          const { s3URL, ipfsURL, size, duration } = notification.data;

          logger.info({
            type: "info",
            msg: "recording-stopped",
            s3URL,
            ipfsURL,
          });

          this.updateRecording({
            url: ipfsURL,
            duration,
            size,
          });
        },
        getAllRecordings: () => {
          const recordingURls = notification.data;
          logger.info("Got all recordings");
          logger.info({ recordingURls });
          this.setRecordings(recordingURls);
        },
        "disabled-last-N": () => {
          const peerIds = this.getPeerIds();

          logger.info({
            type: "info",
            msg: "disabled-last-N",
            meta: {
              peerIds,
            },
          });

          if (this.isLastNActive()) this.deactivateLastN();
        },

        "updated-last-N": () => {
          const { lastNPeers, mostInactivePeerIdInLastN } = <LastNData>(
            notification.data
          );

          const meId = this.peerId;
          const lastNArr = lastNPeers.includes(meId)
            ? lastNPeers.filter((peerId: string) => peerId !== meId)
            : lastNPeers.filter((peerId: string) =>
                mostInactivePeerIdInLastN
                  ? peerId !== mostInactivePeerIdInLastN
                  : lastNPeers[lastNPeers.length - 1] !== peerId,
              );

          logger.info({
            type: "info",
            msg: "updated-last-N | Updaing with new lastNPeers",
          });

          if (!this.isLastNActive()) this.activateLastN();

          this.setActiveViewPort(lastNArr);
        },
        "updated-network-strength": () => {
          const { networkStrength } = notification.data;

          this.setNetworkStats(networkStrength);
        },

        receiveData: () => {
          const { type, payload } = notification.data;
          // For Better understandlibility of code used if-else :)
          if (type === "dm") {
            const { toId, fromId, message, timestamp } = payload;
            if (toId === "mainRoom") {
              this.setChat(message, "mainRoom", fromId, timestamp);
              if (fromId !== this.peerId) this.increaseUnread("mainRoom");
            } else {
              const swappedId = fromId;
              this.setChat(message, swappedId, fromId, timestamp);
              this.increaseUnread(fromId);
            }
            if (fromId !== this.peerId) {
              this.setNotificationSounds("chat");
            }
          }
          if (type === "reaction") {
            const { peerId, reaction } = payload;
            if (this.peerId !== peerId) this.addReaction(peerId, reaction);
          }
          if (type === "raiseHand") {
            const { peerId, isHandRaised } = payload;
            this.togglePeerHandRaise(peerId, isHandRaised);
          }

          if (type === "sharedFile") {
            const { peerId, fileDetails } = payload;
            this.addSharedFile(fileDetails);
            this.setChat(
              "I've shared a file, please check it out from shared files tab.",
              "mainRoom",
              peerId,
              now(),
            );
            this.increaseUnread("mainRoom");
          }
        },

        enabledHostControls: () => {
          const { type } = notification.data;
          const enableHostControlFuncs: IEnableHostControl = {
            enableHostOnlyVideo: () => {
              // this.disableWebcam();
              this.setSingleHostControl("allowVideo", false);
            },
            enableHostOnlyAudio: () => {
              // this.muteMic();
              this.setSingleHostControl("allowAudio", false);
            },
            enableHostOnlyScreenShare: () => {
              // this.disableShare();
              this.setSingleHostControl("allowScreenShare", false);
            },
            enableHostOnlyChat: () => {
              this.setSingleHostControl("allowChat", false);
            },
          };
          enableHostControlFuncs[type]();
        },
        disabledHostControls: () => {
          const { type } = notification.data;
          const disableHostControlFuncs: IDisableHostControl = {
            disableHostOnlyVideo: () => {
              this.setSingleHostControl("allowVideo", true);
            },
            disableHostOnlyAudio: () => {
              this.setSingleHostControl("allowAudio", true);
            },
            disableHostOnlyScreenShare: () => {
              this.setSingleHostControl("allowScreenShare", true);
            },
            disableHostOnlyChat: () => {
              this.setSingleHostControl("allowChat", true);
            },
          };
          disableHostControlFuncs[type]();
        },
        hostIs: () => {
          const { hostId } = notification.data;
          logger.info({ type: "info", msg: "hostIs" });
          this.setHost(hostId);
        },
        updatedCoHosts: () => {
          const { coHosts } = notification.data;
          logger.info({ type: "info", msg: "updatedCoHosts" });
          this.setCoHosts(coHosts);
        },
        muteMe: () => {
          this.muteMic();
        },
        disableMyCam: () => {
          this.disableWebcam();
        },
        stopScreenShare: () => {
          this.disableShare();
        },

        streamStarted: () => {
          const { stream, platform } = notification.data;
          logger.info("stream started", { stream });
          if (stream.id) {
            const streamData: IStreamData = {
              isLive: true,
              isLoading: false,
              url: `https://livepeer.huddle01.com/livestream?streamId=${stream.id}`,
            };
            this.setStreamData(platform, streamData);
            this.setStreamPlatform(platform);
          }
        },

        streamStopped: () => {
          const { platform } = notification.data;
          logger.info("stream started");

          this.stopStreaming(platform);
        },

        recordingOrStreamingError: () => {
          const { type } = notification.data; // ONE MORE PARAMETER MSG WITH MSG OF ERROR
          if (type == "record") {
            this.setRecordingEnded();
          }
          if (type == "stream") {
            this.stopStreaming("livepeer");
          }
        },
        "room-lock-state": () => {
          const { isRoomLocked } = notification.data;
          this.setRoomLockState(isRoomLocked);
        },
        downlinkBwe: () => {
          logger.info("downlinkBwe event :", notification.data);
        },
      };

      notifMethods[notification.method]?.();
    });
  }

  async joinRoom() {
    if (!this.socket) return;

    try {
      await this.loadMediasoupDevice();

      if (!this.mediasoupDevice) return;

      type ITurnServerType = {
        username: string;
        credential: string;
        url: string;
      };

      try {
        const { data: turn } = await axios.get(
          "https://jbzp43rb25.execute-api.ap-south-1.amazonaws.com/turn",
        );
        const turnServers = turn.servers as ITurnServerType[];

        const fixedTurnServers = turnServers.map(({ url, ...rest }) => ({
          ...rest,
          urls: url,
        }));

        this._turn = fixedTurnServers || [];
      } catch (err) {
        logger.error("error fetching turn servers", err);
      }

      // Do not create sendtranport for bot
      // TODO: also dont create send transport for those who didn't gave mic and cam perms
      if (!this.isBot) await this.createSendTransport();
      await this.createRecvTransport();

      const joinedData = await this.socket.request("join", {
        displayName: this.getDisplayName(),
        rtpCapabilities: this.mediasoupDevice.rtpCapabilities,
        sctpCapabilities: this.mediasoupDevice.sctpCapabilities,
        avatarUrl: this.getAvatarUrl(),
        device: {
          device: getDeviceType(),
          name: this.mediasoupDevice.handlerName,
        },
        // TODO: get mic and cam states
        // micEnabled: store.getState().btmBar.micEnabled,
        // videoEnabled: store.getState().btmBar.videoEnabled,
      });

      const {
        peers,
        roomId,
        hostId,
        coHostIds,
        createdAt,
        isRoomLocked,
        isRecordingOrStreaming,
        typeOfStreamingOrRecording,
        streamId,
        sharedFiles,
        hostControls,
        streamingPlatform,
      } = joinedData;

      peers.forEach((peer: INewPeerState & { id: string }) => {
        if (peer.id !== "recorder_bot") {
          const newPeer: INewPeerState = {
            peerId: peer.id,
            displayName: peer.displayName,
            avatarUrl: peer.avatarUrl,
            isMicPaused: true,
            isCamPaused: true,
            isSharePaused: true,
            isHandRaised: false,
            reaction: peer.reaction,
          };
          this.addPeer(peer.id, newPeer);
          this.addPeerPort(peer.id);
        }
      });

      if (!hostControls.allowVideo) {
        this.toggleProducerMedia("cam", "off");
        await this.disableAllCamStreams();
      }

      if (!this.getProducerState("cam") && hostControls.allowVideo)
        await this.enableWebcam();

      const micPaused = this.isMicPaused();
      await this.enableMic();

      if (!hostControls.allowAudio || micPaused) {
        this.toggleProducerMedia("mic", "off");
        await this.muteMic();
      }

      // After everything, setJoined
      this.initHostControls(hostId, this.peerId, hostControls, coHostIds);
      this.setRoomId(roomId);
      this.setRoomLockState(isRoomLocked);
      this.setActiveViewPortForNewPeer();

      // After everything, setJoined
      this.setCreatedAt(createdAt);
      if (streamingPlatform) {
        const streamObj: IStreamData = {
          isLive: true,
          isLoading: false,
          url: `https://livepeer.huddle01.com/livestream?streamId=${streamId}`,
        };

        this.setStreamData(streamingPlatform, streamObj);
        this.setStreamPlatform(streamingPlatform);
      }
      this.setSharedFiles(sharedFiles);
      if (isRecordingOrStreaming) {
        if (typeOfStreamingOrRecording == "record") {
          this.toggleRecording(true);
        }
      }

      const numOfPeersToSwitchView = this.isBot ? 3 : 2;

      if (this.getPeerIds().length > numOfPeersToSwitchView) {
        this.setLayoutView("sideBarGridView");
      }

      this.setJoined();
    } catch (error) {
      // TODO: Handle error
      // Temp alert

      logger.error({
        type: "error",
        error,
        message: "Couldn't join room",
        loc: "RoomProvider.tsx -> joinRoom()",
      });
    }
  }

  async enableWebcam(figmentDisable: boolean = true) {
    if (!this.sendTransport) return;
    const isCamPaused = this.getProducerState("cam");

    try {
      if (isCamPaused && figmentDisable) {
        this.disableCamStream();
        await this.enableCamStream();
      }

      const stream = this.getCamStream();

      if (!stream) {
        logger.error({
          type: "error",
          msg: "enableWebcam() | No Stream Enabled",
        });
        return;
      }
      // TODO: Figmented stream

      const track = stream.getVideoTracks()[0];
      let encodings;
      const codecOptions = {
        videoGoogleStartBitrate: 1000,
      };

      const useSimulcast = true;

      if (useSimulcast) {
        encodings = WEBCAM_SIMULCAST_ENCODINGS;
      }

      this._webcamProducer = await this.sendTransport.produce({
        track,
        encodings,
        codecOptions,
        appData: {
          type: "cam",
          share: false,
        },
      });

      const webcamProd: MediaConsumer = {
        id: this._webcamProducer.id,
        track: this._webcamProducer.track as MediaStreamTrack,
        isPaused: false,
        peerId: this.peerId,
        appData: { type: "cam", peerId: this.peerId },
      };

      this.addProducerMedia("cam", webcamProd);

      logger.info({
        type: "info",
        msg: "enableWebcam",
        webcamProducer: this._webcamProducer,
      });

      this._webcamProducer.on("transportclose", async () => {
        logger.info({
          type: "info",
          msg: "enableWebcam | transportclose",
          webcamProducer: this._webcamProducer,
        });
        this.removeProducerMedia("cam");

        this.toggleFigmentStream("disable");

        await disableFigment();
        this._webcamProducer = null;
      });

      this._webcamProducer.on("trackended", async () => {
        logger.info({
          type: "info",
          msg: "enableWebcam | trackended",
          webcamProducer: this._webcamProducer,
        });
        logger.info({
          type: "error",
          text: "Webcam disconnected!",
        });
        this.disableWebcam().catch(() => {});
      });

      logger.info({
        type: "info",
        msg: "Webcam enabled",
        webcamProducer: this._webcamProducer,
      });
    } catch (error) {
      logger.error({ type: "error", error });
    }
  }

  async disableWebcam(figmentDisable: boolean = true) {
    if (!this.socket) {
      logger.error({ type: "error", msg: "disableWebcam() | No socket" });
      return;
    }
    if (!this._webcamProducer) {
      logger.info({ type: "info", msg: "disableWebcam | No Producer" });
      return;
    }

    logger.info("webcamProducer is on");
    this._webcamProducer.track?.stop();
    this._webcamProducer.close();

    this.removeProducerMedia("cam");

    try {
      await this.socket.request("closeProducer", {
        producerId: this._webcamProducer.id,
      });
      this._webcamProducer = null;

      if (figmentDisable) {
        this.toggleFigmentStream("disable");

        await disableFigment();

        logger.info({
          type: "info",
          msg: "disableWebcam | figment disabled",
        });
      }

      this.disableCamStream();

      const stream = this.getCamStream();

      if (stream) {
        logger.info({
          type: "info",
          msg: "disableWebcam | stream Still Enabled",
          stream,
        });
      }

      logger.info("server closed producer");
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error closing server-side webcam Producer: ${error}`,
      });
    }
  }

  async changeWebcam(mediaDevice?: MediaDeviceInfo) {
    if (this._loading) return;
    this._loading = true;
    if (mediaDevice) {
      this.setMediaDevice(mediaDevice);
    }
    try {
      await this.disableWebcam();
      await this.enableWebcam();
    } catch (error) {
      logger.error({ type: "error", msg: "changeWebcam()", error });
    }
    this._loading = false;
  }

  async pauseVideo() {
    logger.info({
      msg: "pauseVideo()",
      _webcamProducer: this._webcamProducer,
      this: this,
    });

    if (!this.socket) return;

    this.produce = false;

    if (!this._webcamProducer) return;

    this._webcamProducer.pause();

    try {
      await this.socket.request("pauseProducer", {
        producerId: this._webcamProducer.id,
      });
      if (this._webcamProducer !== null) this.removeProducerMedia("cam");
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error pausing server-side webcam Producer: ${error}`,
      });
    }
  }

  /**
   * @description - Disables the mic producer, basically remove the producer from state.
   */
  async disableMic() {
    if (!this.micProducer || !this.socket) return;

    this.micProducer.close();

    logger.info({
      type: "info",
      text: `disableMic()`,
    });

    this.removeStreamFromHark(this.peerId);

    try {
      await this.socket.request("closeProducer", {
        producerId: this.micProducer.id,
      });
      this.removeProducerMedia("mic");
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error closing server-side mic Producer: ${error}`,
      });
    }

    this.micProducer = null;
  }

  /**
   * @description - Enables the mic producer, basically add the producer to state.
   */
  async enableMic() {
    if (!this.mediasoupDevice || !this.sendTransport) return;

    // if (!this.mediasoupDevice.canProduce('audio')) {
    //   logger.error('enableMic() | cannot produce audio');
    //   return;
    // }

    try {
      this.disableMicStream();
      this.removeStreamFromHark(this.peerId);

      await this.enableMicStream();

      const stream = this.getMicStream();
      logger.info({ micstream: stream });

      if (!stream) {
        logger.error({
          type: "error",
          msg: "enableMic() | No Stream Enabled",
        });
        return;
      }
      const track = stream.getAudioTracks()[0];

      this.addStreamToHark(track, this.peerId);

      this.micProducer = await this.sendTransport.produce({
        track,
        appData: {
          type: "mic",
          share: false,
        },
      });

      const micProd: MediaConsumer = {
        id: this.micProducer.id,
        track: this.micProducer.track as MediaStreamTrack,
        isPaused: false,
        peerId: this.peerId,
        appData: { type: "mic", peerId: this.peerId },
      };

      if (this.micProducer !== null) this.addProducerMedia("mic", micProd);

      this.micProducer.on("transportclose", () => {
        this.micProducer = null;
      });

      this.micProducer.on("trackended", async () => {
        logger.info({
          type: "error",
          text: "Microphone disconnected!",
        });
        try {
          await this.disableMic();
          await this.enableMic();
        } catch (error) {
          //this will/should never get printed, but just in case :)
          alert(
            "error in switching audio input sources, please refresh your tab",
          );
        }
      });
    } catch (error) {
      logger.error({ type: "error | enableMic() ", error });
    }
  }

  /**
   * @description - Disables hence delete the mic producer, then enables again hence add a new prducer with that deviceId;
   */
  async changeMic(audioDevice: MediaDeviceInfo) {
    if (this._loading) return;
    this._loading = true;

    if (audioDevice) {
      this.setAudioDevice(audioDevice);
    }

    try {
      await this.disableMic();
      await this.enableMic();
      await this.unmuteMic();
    } catch (error) {
      logger.error({ type: "error", msg: "changeMic()", error });
    } finally {
      this._loading = false;
    }
  }

  /**
   * @description - Dont delete the producer, just **pause** it.
   */
  async muteMic() {
    logger.info({
      msg: "muteMic()",
      this: this,
    });

    if (!this.socket) return;

    if (!this.micProducer) return;

    this.micProducer.pause();

    try {
      await this.socket.request("pauseProducer", {
        producerId: this.micProducer.id,
      });

      if (this.micProducer !== null) this.toggleProducerMedia("mic", "off");
    } catch (error) {
      logger.info("muteMic() | failed: %o", error);
    }
  }

  /**
   * @description - Dont delete the producer, just **Unpause** it.
   */
  async unmuteMic() {
    //logger.debug("unmuteMic()");
    logger.info({
      msg: "unmuteMic()",
      this: this,
    });
    if (!this.socket) {
      logger.info("unmuteMic() | no socket");
      return;
    }

    if (!this.micProducer) {
      logger.info({
        type: "info",
        msg: "unmuteMic() | micProducer is null enabling mic",
      });
      await this.enableMic();
      return;
    }

    this.micProducer.resume();

    try {
      await this.socket.request("resumeProducer", {
        producerId: this.micProducer.id,
      });

      if (this.micProducer !== null) this.toggleProducerMedia("mic", "on");
    } catch (error) {
      logger.info("unmuteMic() | failed: %o", error);
    }
  }

  async enableShare() {
    if (!this.mediasoupDevice || !this.sendTransport) {
      logger.error("enableShare() | cannot produce audio");
      return;
    }

    if (!this.mediasoupDevice.canProduce("video")) {
      logger.error("enableShare() | cannot produce video");

      return;
    }

    let track: MediaStreamTrack | null = null;
    let audioTrack: MediaStreamTrack | null = null;
    try {
      let constraints = {
        video: {
          displaySurface: "monitor",
          logicalSurface: true,
          cursor: true,
          width: { max: 1920 },
          height: { max: 1080 },
          frameRate: { max: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      track = stream.getVideoTracks()[0];
      audioTrack = stream.getAudioTracks()[0];

      this._shareVideoProducer = await this.sendTransport.produce({
        track,
        appData: {
          type: "share",
          share: true,
        },
      });

      //creating audio producer for the share stream
      if (audioTrack) {
        this._shareAudioProducer = await this.sendTransport.produce({
          track: audioTrack,
          appData: {
            type: "shareAudio",
            share: true,
          },
        });
      }

      const shareProd: MediaConsumer = {
        id: this._shareVideoProducer.id,
        peerId: this.peerId,
        track: this._shareVideoProducer.track as MediaStreamTrack,
        isPaused: this._shareVideoProducer.paused,
        appData: { type: "share", peerId: this.peerId },
      };

      if (this._shareVideoProducer !== null)
        this.addProducerMedia("share", shareProd);

      if (this._shareAudioProducer !== null) {
        const shareAudioProd: MediaConsumer = {
          id: this._shareAudioProducer.id,
          peerId: this.peerId,
          track: this._shareAudioProducer.track as MediaStreamTrack,
          isPaused: this._shareAudioProducer.paused,
          appData: { type: "shareAudio", peerId: this.peerId },
        };
        this.addProducerMedia("shareAudio", shareAudioProd);
        logger.info({
          type: "info",
          msg: "Share Audio enabled",
          shareVideoProducer: this._shareAudioProducer,
          shareAudioProd: shareAudioProd,
        });
      }

      this._shareVideoProducer.on("transportclose", async () => {
        await this.disableShare();
      });

      this._shareVideoProducer.on("trackended", async () => {
        logger.info({
          type: "error",
          text: "shareScreen Disconnected!",
        });
        try {
          await this.disableShare();
        } catch (error) {
          alert(
            "error in switching audio input sources, please refresh your tab",
          );
        }
      });

      logger.info({
        type: "info",
        msg: "Share enabled",
        shareProducer: this._shareVideoProducer,
      });
      this.enableScreenShare(this.peerId);
    } catch (error) {
      if (track) {
        track.stop();
        this.disableScreenShare("grid");
      }
      logger.error({ type: "error", error });
    }
  }

  async disableShare() {
    if (!this._shareVideoProducer || !this.socket) return;

    this._shareVideoProducer.close();

    this.removeProducerMedia("share");

    if (this._shareAudioProducer !== null) {
      this._shareAudioProducer.close();
      this.removeProducerMedia("shareAudio");
    }
    try {
      await this.socket.request("closeProducer", {
        producerId: this._shareVideoProducer.id,
      });
      logger.info("closed server side share producer");
      if (this._shareAudioProducer) {
        await this.socket.request("closeProducer", {
          producerId: this._shareAudioProducer.id,
        });
        logger.info("closed server side audio share producer");
      }
      logger.info({
        type: "info",
        msg: "Share disabled",
        shareProducer: this._shareVideoProducer,
      });
      this.disableScreenShare("grid");
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error closing server-side share Producer: ${error}`,
      });
    }
    this._shareVideoProducer = null;
    this._shareAudioProducer = null;
  }

  async emailRecording(to: string, url: string) {
    if (!this.socket) return;

    try {
      await this.socket.request("emailRecordingUrl", { to, url });
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error emailing recording url: ${error}`,
      });
    }
  }

  async getClientNetworkStats() {
    logger.debug("getClientNetworkStats()");
    if (!this.socket) return;

    const stats = await this.socket.request("getClientNetworkStats", {
      audioProducerId: this.micProducer?.id || "",
      videoProducerId: this._webcamProducer?.id || "",
      sendTransportId: this.sendTransport?.id || "",
      recvTransportId: this.recvTransport?.id || "",
    });

    logger.info({ stats });

    return stats;
  }

  // Host control Functions
  async handleEnableHostControl(
    control: EEnableHostControl,
    controlType: keyof THostControls,
  ) {
    if (!this.socket) return;
    try {
      await this.socket.request("handleEnableHostControl", { control });
      this.setSingleHostControl(controlType, false);
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error enabling host control: ${error}`,
      });
    }
  }

  async handleDisableHostControl(
    control: EDisableHostControl,
    controlType: keyof THostControls,
  ) {
    if (!this.socket) return;
    try {
      logger.info("huddlecliend handledisable", { control });
      await this.socket.request("handleDisableHostControl", { control });
      this.setSingleHostControl(controlType, true);
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error disabling host control: ${error}`,
      });
    }
  }

  async makeACohost(coHostId: string) {
    if (!this.socket) return;
    try {
      await this.socket.request("makeACoHost", { coHostId });
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error making a cohost: ${error}`,
      });
    }
  }
  async removeACohost(coHostId: string) {
    if (!this.socket) return;
    try {
      await this.socket.request("removeACoHost", { coHostId });
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error making a cohost: ${error}`,
      });
    }
  }
  async kickPeerFromRoom(peerIdToKick: string) {
    if (!this.socket) return;
    try {
      await this.socket.request("kickPeerFromRoom", { peerIdToKick });
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error kicking peer from room: ${error}`,
      });
    }
  }

  async closeRoomForEverybody() {
    if (!this.socket) return;

    try {
      await this.socket.request("closeRoomForEverybody");
      this.close();
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error closeRoomForEverybody: ${error}`,
      });
    }
  }

  async disablePeerMic(peerId: string) {
    if (!this.socket) return;
    try {
      await this.socket.request("mutePeer", { peerId });
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error mutePeer: ${error}`,
      });
    }
  }
  async disablePeerCam(peerId: string) {
    if (!this.socket) return;
    try {
      await this.socket.request("disablePeerCam", { peerId });
    } catch (error) {
      logger.error({
        type: "error",
        text: `Error disablePeerCam: ${error}`,
      });
    }
  }

  async muteEveryone() {
    if (!this.socket) return;

    try {
      await this.socket.request("muteEveryone");
    } catch (error) {
      throw new Error(`Cant mute everyone ${error}`);
    }
  }

  async toggleRoomLock() {
    if (!this.socket) return;
    try {
      await this.socket.request("toggleRoomLock", {
        state: !this.getRoomLockState(),
      });
    } catch (error) {
      throw new Error(`Cant toggle room lock ${error}`);
    }
  }

  async pauseConsumer(
    consumerId: string,
    peerId: string,
    type: MediaConsumerTypes,
  ) {
    if (!this.consumers.has(consumerId) || !this.socket) return;

    try {
      const consumer = this.consumers.get(consumerId);

      if (!consumer) return;

      this.socket.request("pauseConsumer", { consumerId: consumerId });

      consumer.pause();
      this.pauseConsumerMedia(peerId, type);
    } catch (err) {
      logger.error({ type: "error", text: `Error pausing consumer ${err}` });
    }
  }

  async resumeConsumer(
    consumerId: string,
    peerId: string,
    type: MediaConsumerTypes,
  ) {
    if (!this.consumers.has(consumerId) || !this.socket) return;

    try {
      const consumer = this.consumers.get(consumerId);

      if (!consumer) return;
      this.socket.request("resumeConsumer", { consumerId: consumerId });

      consumer.resume();
      this.resumeConsumerMedia(peerId, type);
    } catch (err) {
      logger.error({ type: "error", text: `Error pausing consumer ${err}` });
    }
  }

  async toggleBandwidthSaver(toggle: boolean) {
    const promises: Promise<void>[] = [];
    Object.entries(this.getParticipants()).forEach(([peerId, peer]) => {
      if (peer.consumers && peer.consumers.cam?.id) {
        promises.push(
          toggle
            ? this.pauseConsumer(peer.consumers.cam.id, peerId, "cam")
            : this.resumeConsumer(peer.consumers.cam.id, peerId, "cam"),
        );
      }
    });
    await Promise.all(promises);
  }

  close(dropReason?: IDropReason) {
    if (!this.socket) return;
    this.setDropState(dropReason || "left");
    this.socket.close();
    triggerIframeEvent("me-left", { peerId: this.peerId });
  }
}
