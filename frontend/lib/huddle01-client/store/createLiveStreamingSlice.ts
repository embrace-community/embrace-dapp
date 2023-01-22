import logger from '../HuddleClient/logger';
import {
  ILiveStream,
  IStreamData,
  IStreamingPlatform,
  StoreSlice,
} from './storeTypes';

const createLiveStreamingSlice: StoreSlice<ILiveStream> = (set, get) => ({
  streamData: {},
  isLiveStreaming: false,
  livePlatform: 'livepeer',

  setPlatform: (platform: IStreamingPlatform) => {
    set({
      livePlatform: platform,
    });
  },

  startStreaming: (platform: IStreamingPlatform) => {
    const alreadyExits = get().streamData[platform];

    if (alreadyExits) {
      logger.info({
        message: `Live streaming already started for platform ${platform}`,
        platform,
      });

      return;
    }

    const streamData: IStreamData = {
      isLive: false,
      isLoading: true,
      url: '',
    };

    set({
      streamData: {
        ...get().streamData,
        [platform]: streamData,
      },
      livePlatform: platform,
    });
  },

  stopStreaming: (platform: IStreamingPlatform) => {
    const platformData = get().streamData[platform];

    if (!platformData) {
      logger.info({
        message: `Tried to set stream loading for platform ${platform} but it was not found in the store`,
        meta: {
          platform,
        },
      });

      return;
    }

    if (!platformData.isLive) {
      logger.info({
        message: `Tried to set stream loading for platform ${platform} but it was NOT live`,
        meta: {
          platform,
        },
      });

      return;
    }

    const streamData = get().streamData;

    get().removeStreamData(platform);

    set({
      streamData,
    });
  },

  setStreamData: (platform: IStreamingPlatform, streamData: IStreamData) => {
    logger.info({
      message: `Setting stream data for platform ${platform}`,
      meta: {
        platform,
        streamData,
      },
    });

    set({
      streamData: {
        ...get().streamData,
        [platform]: streamData,
      },
    });
  },

  removeStreamData: (platform: IStreamingPlatform) => {
    const streamData = get().streamData;

    if (!streamData) {
      logger.info({
        message: `Tried to remove stream data for platform ${platform} but it was not found in the store`,
        meta: {
          platform,
        },
      });

      return;
    }

    logger.info({
      message: `Removing stream data for platform ${platform}`,
      meta: {
        platform,
      },
    });

    delete streamData[platform];

    set({
      streamData,
    });
  },
});

export default createLiveStreamingSlice;

// isLiveStreamingPlatforms: () => {
//   const isLiveStreamingPlatforms: IStreamingPlatform[] = [];

//   const streamData = get().streamData;
//   [...streamData].map(platform => {
//     if (platform[1].isLive) {
//       logger.info({
//         message: `Live stream is active on ${platform[0]}`,
//         meta: { platform: platform[0] },
//       });
//       isLiveStreamingPlatforms.push(platform[0]);
//     }
//   });

//   return isLiveStreamingPlatforms;
// },

// isStreamLiveOnPlatform: (platform: IStreamingPlatform) => {
//   const platformData = get().streamData.get(platform);

//   if (platformData) {
//     logger.info({
//       message: `isStreamLiveOnPlatform | Tried to set stream loading for platform ${platform} but it was already live`,
//       meta: {
//         platform,
//       },
//     });

//     return platformData.isLive;
//   }

//   return false;
// },

// setStreamDataForPlatform: (
//   platform: IStreamingPlatform,
//   streamData: IStreamData
// ) => {
//   set(state => ({ streamData: state.streamData.set(platform, streamData) }));
// },

// startStreaming: (platform: IStreamingPlatform) => {
//   const platformData = get().streamData.get(platform);

//   if (platformData) {
//     logger.info({
//       message: `Tried to set stream loading for platform ${platform} but it was already live`,
//       meta: {
//         platform,
//       },
//     });

//     return;
//   }
//   const streamData: IStreamData = {
//     isLive: false,
//     isLoading: true,
//     url: '',
//   };

//   set(state => ({
//     streamData: state.streamData.set(platform, streamData),
//   }));
// },

// stopStreaming: (platform: IStreamingPlatform) => {
//   const platformData = get().streamData.get(platform);

//   if (!platformData) {
//     logger.info({
//       message: `Tried to set stream loading for platform ${platform} but it was not found in the store`,
//       meta: {
//         platform,
//       },
//     });

//     return;
//   }

//   if (!platformData.isLive) {
//     logger.info({
//       message: `Tried to set stream loading for platform ${platform} but it was NOT live`,
//       meta: {
//         platform,
//       },
//     });

//     return;
//   }

//   platformData.url = '';
//   platformData.isLoading = false;
//   platformData.isLive = false;

//   const isLive = get().isLiveStreamingPlatforms().length > 0;

//   set(state => ({
//     isLiveStreaming: isLive,
//     streamData: state.streamData.set(platform, platformData),
//   }));
// },

// setStreamLink: (platform: IStreamingPlatform, streamLink: string) => {
//   const platformData = get().streamData.get(platform);

//   if (!platformData) {
//     logger.info({
//       message: `Tried to set stream loading for platform ${platform} but it was not found in the store`,
//       meta: {
//         platform,
//       },
//     });

//     return;
//   }

//   platformData.isLoading = false;
//   platformData.isLive = true;
//   platformData.url = streamLink;

//   set(state => ({
//     isLiveStreaming: true,
//     streamData: state.streamData.set(platform, platformData),
//   }));

//   logger.info('set stream link', { x: get().streamData });
// },

// getStreamDataForPlatform: (platform: IStreamingPlatform) => {
//   const platformData = get().streamData.get(platform);

//   if (!platformData) {
//     logger.info({
//       message: `Tried to set stream loading for platform ${platform} but it was not found in the store`,
//       meta: {
//         platform,
//       },
//     });

//     return;
//   }

//   return platformData;
// },

// getStreamLinkForPlatform: (platform: IStreamingPlatform) => {
//   const platformData = get().streamData.get(platform);

//   if (!platformData) {
//     logger.info({
//       message: `Tried to set stream loading for platform ${platform} but it was not found in the store`,
//       meta: {
//         platform,
//       },
//     });

//     return '';
//   }

//   return platformData.url;
// },

// clearStreamData: () => {
//   get().streamData.clear();
//   set({ streamData: get().streamData });

//   logger.info({
//     type: 'info',
//     message: 'Cleared ALL stream data',
//   });
// },
