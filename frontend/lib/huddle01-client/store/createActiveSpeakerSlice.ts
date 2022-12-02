import hark from 'hark';
import { IActiveSpeakerState, StoreSlice } from './storeTypes';
import peerIdToHark from '../utils/peerIdToHarkEvent';

const createActiveSpeakerSlice: StoreSlice<IActiveSpeakerState> = (
  set,
  get
) => ({
  dominantSpeaker: '',
  peerIdToVolume: {},

  addStreamToHark: (track, peerId) => {
    const stream = new MediaStream();
    stream.addTrack(track);

    if (!stream.getAudioTracks()[0]) return;

    const removeStreamFromHark = get().removeStreamFromHark;

    if (get().peerIdToVolume[peerId]) removeStreamFromHark(peerId);

    const harkEvent = hark(stream, { interval: 1000, play: false });

    set(() => ({
      peerIdToVolume: {
        ...get().peerIdToVolume,
        [peerId]: 0,
      },
    }));

    peerIdToHark.set(peerId, harkEvent);

    harkEvent.on('volume_change', dBs => {
      const audioVolume = Math.round(Math.pow(10, dBs / 85) * 10);

      set(() => ({
        peerIdToVolume: {
          ...get().peerIdToVolume,
          [peerId]: audioVolume,
        },
      }));

      const dominantSpeaker = get().dominantSpeaker;
      const activeSpeakerDb = get().peerIdToVolume[dominantSpeaker];

      if (!dominantSpeaker.length) {
        set(() => ({
          dominantSpeaker: peerId,
        }));
        return;
      }

      if (audioVolume > (activeSpeakerDb || 0)) {
        if (peerId === dominantSpeaker) return;
        set(() => ({
          dominantSpeaker: peerId,
        }));
      }
    });
  },

  removeStreamFromHark: peerId => {
    if (!get().peerIdToVolume[peerId]) return;

    const harkEvent = peerIdToHark.get(peerId);

    if (!harkEvent) return;

    harkEvent.stop();

    const newpeerIdToVolume = get().peerIdToVolume;

    peerIdToHark.delete(peerId);
    delete newpeerIdToVolume[peerId];

    set(() => ({
      peerIdToVolume: newpeerIdToVolume,
    }));
  },
});

export default createActiveSpeakerSlice;
