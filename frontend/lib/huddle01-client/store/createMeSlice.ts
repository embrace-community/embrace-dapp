import {
  MediaConsumer,
  MediaConsumerTypes,
  StoreSlice,
  IMeStoreType,
  IMeStoreStateKeys,
  IMeInitState,
  IDeviceSwitch,
  MediaConsumerTypesObj,
  Reaction,
} from './storeTypes';

const createMeSlice: StoreSlice<IMeStoreType> = (set, get) => ({
  peerId: '',
  displayName: '',
  avatarUrl: '',
  isSharePaused: true,
  isCamPaused: false,
  isMicPaused: false,
  isHandRaised: false,
  reaction: '',

  producers: {
    cam: undefined,
    mic: undefined,
    share: undefined,
    shareAudio: undefined,
  },

  initMe: (meInit: IMeInitState) => {
    set(meInit);
  },

  setMe: (consumerType: IMeStoreStateKeys, value: any) => {
    set(() => ({
      [consumerType]: value,
    }));
  },

  setAvatarUrl: (avatarUrl: string) => {
    set(() => ({
      avatarUrl,
    }));
  },
  addProducerMedia: (
    producerType: MediaConsumerTypes,
    producer: MediaConsumer
  ) => {
    const producerTracks = get().producers;

    set(() => ({
      producers: {
        ...producerTracks,
        [producerType]: producer,
      },
      [MediaConsumerTypesObj[producerType]]: false,
    }));
  },

  removeProducerMedia: (producerType: MediaConsumerTypes) => {
    const producerTracks = get().producers;
    delete producerTracks[producerType];

    set(() => ({
      producers: {
        ...producerTracks,
      },
      [MediaConsumerTypesObj[producerType]]: true,
    }));
  },

  toggleProducerMedia: (
    producerType: MediaConsumerTypes,
    value: IDeviceSwitch
  ) => {
    set(() => ({
      [MediaConsumerTypesObj[producerType]]: value === 'off',
    }));
  },

  updateProducerMedia(
    producerType: MediaConsumerTypes,
    producer: MediaConsumer
  ) {
    const producerTracks = get().producers;

    set(() => ({
      producers: {
        ...producerTracks,
        [producerType]: producer,
      },
    }));
  },
  toggleMeHandRaise: (isHandRaised: boolean) => {
    set(() => ({
      isHandRaised,
    }));
  },

  addMeReaction: (reaction: Reaction) => {
    set(() => ({
      reaction,
    }));
    setTimeout(() => {
      get().rmMeReaction();
    }, 5000);
  },

  rmMeReaction: () => {
    set(() => ({
      reaction: '',
    }));
  },
});

export default createMeSlice;
