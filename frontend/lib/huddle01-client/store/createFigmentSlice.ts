import { IFigmentStoreType, IMediErrorType, StoreSlice } from './storeTypes';
import { VIDEO_CONSTRAINS } from '../constants';
import logger from '../HuddleClient/logger';
import { initFigment } from '../utils/figment';

const createFigmentSlice: StoreSlice<IFigmentStoreType> = (set, get) => ({
  isFigmentEnabled: false,
  figment: {
    figmentType: 'enable',
    figmentStream: null, // stream;
    figmentstreamError: null, // error
    figmentLoading: false, // loading
  },

  enableFigmentCamStream: async (mediaDevice?: MediaDeviceInfo) => {
    if (get().isFigmentEnabled) {
      logger.info({
        type: 'info',
        msg: 'Figment stream already enabled',
      });
      return;
    }
    const deviceEnabledConstrains = {
      video: {
        ...VIDEO_CONSTRAINS.hd,
        deviceId: mediaDevice?.deviceId,
      },
    };
    logger.info('Enabling new figment stream');
    const prevFigmentStream = get().figment;
    await navigator.mediaDevices
      .getUserMedia(deviceEnabledConstrains)
      .then(_stream => {
        set(() => ({
          figment: {
            ...prevFigmentStream,
            figmentStream: _stream,
            figmentLoading: false,
          },
          isFigmentEnabled: true,
        }));
      })
      .catch(_error => {
        set(() => ({
          figment: {
            ...prevFigmentStream,
            figmentstreamError: {
              type: _error.name,
              blocked: _error.name === 'NotAllowedError',
            },
            figmentLoading: false,
          },
          isFigmentEnabled: false,
        }));
      });
  },

  disableFigmentStream: () => {
    const {
      figment: { figmentStream },
    } = get();
    if (!figmentStream) {
      logger.info({
        type: 'error',
        message: 'figmentStream is null',
      });
      return;
    }
    figmentStream.getTracks().forEach(track => track.stop());
    set(() => ({
      figment: { ...get().figment, figmentStream: null, figmentLoading: false },
      isFigmentEnabled: false,
    }));
  },

  setFigmentStream: (stream: MediaStream) => {
    set(() => ({
      figment: { ...get().figment, figmentStream: stream },
    }));
  },

  setFigmentStreamError: (error: IMediErrorType) => {
    set(() => ({
      figment: {
        ...get().figment,
        figmentstreamError: {
          type: error || 'UnknownError',
          blocked: error === 'NotAllowedError',
        },
      },
    }));
  },

  setFigmentEnabled: (isFigmentEnabled: boolean) => {
    set(() => ({
      isFigmentEnabled,
    }));
  },

  toggleFigmentType: (figmentType: 'blur' | 'image' | 'video') => {
    logger.info('toggleFigmentType', { figmentType });
    set(() => ({
      figment: {
        ...get().figment,
        figmentType,
      },
    }));
  },

  toggleFigmentStream: async (streamState: 'enable' | 'disable' | 'switch') => {
    if (streamState === 'enable' && !get().figment.figmentStream) {
      logger.info({
        type: 'info',
        msg: 'Figment Stream Init, Cam Stream Returned',
      });
      await get().enableFigmentCamStream();
      return;
    }
    if (streamState === 'switch') {
      logger.info({
        type: 'info',
        msg: 'Toggling figment stream',
      });
      get().disableFigmentStream();

      logger.info({
        type: 'info',
        msg: 'Disable figment stream',
        figment: get().figment.figmentStream,
      });

      await get().enableFigmentCamStream();

      logger.info({
        type: 'info',
        msg: 'Enable figment stream',
        figment: get().figment.figmentStream,
      });

      return;
    }

    if (streamState === 'disable') {
      get().disableFigmentStream();
    } else {
      logger.error({
        type: 'error',
        message: 'toggleFigmentStream: invalid streamState',
        streamState,
      });
    }
  },

  initFigmentStream: async () => {
    const stream = get().figment.figmentStream;

    if (stream && get().isFigmentEnabled) {
      const figTrack = await initFigment(stream);

      logger.info({ figTrack, stream, isSame: figTrack === stream });

      get().setFigmentStream(figTrack);

      logger.info({
        type: 'info',
        msg: 'Figment Stream Initialised finally',
        figment: figTrack,
      });
    }

    if (!stream) {
      logger.error({
        type: 'error',
        message: 'Figment Stream is null',
        stream,
      });
    }
  },
});

export default createFigmentSlice;
