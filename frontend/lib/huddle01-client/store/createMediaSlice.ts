import { VIDEO_CONSTRAINS } from '../constants';
import logger from '../HuddleClient/logger';
import { IMediaSlice, IMediErrorType, StoreSlice } from './storeTypes';

const createMediaSlice: StoreSlice<IMediaSlice> = (set, get) => ({
  mediaDevice: null, // select
  stream: null, // stream;
  streamError: null, // error
  deviceLoading: true, // loading
  streamsArry: [], // array of streams

  // figment ===> stream;

  enableStream: async () => {
    if (get().stream) {
      logger.error({
        type: 'error',
        msg: 'createMediaSlice.enableStream() | No stream',
      });
      return;
    }

    const deviceEnabledConstrains = {
      video: {
        ...VIDEO_CONSTRAINS.hd,
        deviceId: get().mediaDevice?.deviceId,
      },
    };

    await navigator.mediaDevices
      .getUserMedia(deviceEnabledConstrains)
      .then(_stream => {
        const _newStreamArray = [...get().streamsArry, _stream];
        set(() => ({
          stream: _stream,
          deviceLoading: false,
          streamsArry: _newStreamArray,
        }));
      })
      .catch(_error => {
        set(() => ({
          streamError: {
            type: _error.name,
            blocked: true,
          },
          deviceLoading: false,
        }));
      });

    if (!get().mediaDevice) {
      const mediaDevices = await get().getMediaDevices();
      logger.info({ mediaDevices });
      get().setMediaDevice(mediaDevices[0]);
    }
  },

  getMediaDevices: async () => {
    const { setStreamError } = get();
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const devices = mediaDevices.filter(({ kind }) => kind === 'videoinput');
      return devices;
    } catch (err) {
      setStreamError((err as Error)?.name);
      return [];
    }
  },

  setMediaDevice: (device: MediaDeviceInfo) => {
    set(() => ({
      mediaDevice: device,
    }));
    logger.info('set');
  },

  switchMediaStream: (stream: MediaStream | null) => {
    logger.info({
      type: 'info',
      msg: 'switchMediaStream() | Switching media stream',
    });
    if (!stream) {
      logger.info({
        type: 'info',
        msg: 'switchMediaStream() | No stream Found using default Stream',
      });
      return;
    }
    get().pauseTracks();
    get().setMediaStream(stream);
  },

  setMediaStream: (stream: MediaStream | null) => {
    logger.info({
      type: 'info',
      msg: 'setMediaStream() | Setting media stream',
      stream,
    });
    set(() => ({ stream }));
  },

  pauseTracks: () => {
    const { stream } = get();
    if (!stream) return;
    // logger.info({
    //   type: 'info',
    //   msg: 'pauseTracks() | Pausing media stream',
    // });
    get().streamsArry.forEach(stream => {
      stream.getTracks().forEach(track => {
        track.stop();
      });
    });
    stream.getTracks().forEach(track => track.stop());
    set(() => ({ stream: null, streamsArry: [] }));
  },

  setDeviceLoading: (loading: boolean) => {
    set(() => ({ deviceLoading: loading }));
  },

  setStreamError: (error: IMediErrorType) => {
    set(() => ({
      streamError: {
        type: error || 'UnknownError',
        blocked: error === 'NotAllowedError',
      },
    }));
  },
});

export default createMediaSlice;
