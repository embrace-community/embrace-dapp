import logger from '../HuddleClient/logger';
import { IMicSlice, IMediErrorType, StoreSlice } from './storeTypes';

const createMicSlice: StoreSlice<IMicSlice> = (set, get) => ({
  micState: {
    mediaDevice: null, // select
    stream: null, // stream;
    streamError: null, // error
    deviceLoading: true, // loading
  },
  // figment ===> stream;

  enableAudioStream: async () => {
    if (get().micState.stream) {
      logger.error({
        type: 'error',
        msg: 'createMediaSlice.enableStream() | No stream',
      });
      return;
    }

    const deviceEnabledConstrains = {
      audio: {
        deviceId: get().micState.mediaDevice?.deviceId,
      },
    };

    logger.info('Enabling new Mic stream');

    await navigator.mediaDevices
      .getUserMedia(deviceEnabledConstrains)
      .then(_stream => {
        set(() => ({
          micState: {
            ...get().micState,
            stream: _stream,
            deviceLoading: false,
          },
        }));
      })
      .catch(_error => {
        set(() => ({
          micState: {
            ...get().micState,
            streamError: {
              type: _error.name,
              blocked: _error.name === 'NotAllowedError',
            },
            deviceLoading: false,
          },
        }));
      });

    if (!get().micState.mediaDevice) {
      const audioDevices = await get().getAudioDevices();
      logger.info({ audioDevices });
      get().setAudioDevice(audioDevices[0]);
    }
  },

  getAudioDevices: async () => {
    const { setAudioStreamError } = get();
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const devices = mediaDevices.filter(({ kind }) => kind === 'audioinput');
      return devices;
    } catch (err) {
      setAudioStreamError((err as Error)?.name);
      return [];
    }
  },

  setAudioDevice: (device: MediaDeviceInfo) => {
    set(() => ({
      micState: {
        ...get().micState,
        mediaDevice: device,
      },
    }));
  },

  switchAudioStream: (stream: MediaStream | null) => {
    logger.info({
      type: 'info',
      msg: 'switchAudioStream() | Switching A stream',
    });
    if (!stream) {
      logger.info({
        type: 'info',
        msg: 'switchAudioStream() | No stream Found using default Stream',
      });
      return;
    }
    get().pauseAudioTracks();
    get().setAudioStream(stream);
  },

  setAudioStream: (stream: MediaStream | null) => {
    logger.info({
      type: 'info',
      msg: 'setAudioStream() | Setting Audio stream',
      stream,
    });
    set(() => ({
      micState: {
        ...get().micState,
        stream,
      },
    }));
  },

  pauseAudioTracks: () => {
    const { stream } = get().micState;
    if (!stream) return;
    logger.info({
      type: 'info',
      msg: 'pauseAudioTracks() | Pausing Audio stream',
    });
    stream.getTracks().forEach(track => track.stop());
    set(() => ({ micState: { ...get().micState, stream: null } }));
  },

  setAudioDeviceLoading: (loading: boolean) => {
    set(() => ({ micState: { ...get().micState, deviceLoading: loading } }));
  },

  setAudioStreamError: (error: IMediErrorType) => {
    set(() => ({
      micState: {
        ...get().micState,
        streamError: {
          type: error || 'UnknownError',
          blocked: error === 'NotAllowedError',
        },
      },
    }));
  },
});

export default createMicSlice;
