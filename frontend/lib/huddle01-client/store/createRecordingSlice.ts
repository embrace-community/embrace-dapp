import { IRecordingStoreType, StoreSlice } from './storeTypes';

const createRecordingSlice: StoreSlice<IRecordingStoreType> = set => ({
  recordingState: {
    inProgress: false,
    processing: false,
    started: false,
  },

  recordings: [],
  newRecording: null,

  startRecording: () => {
    set(state => ({
      recordingState: { ...state.recordingState, inProgress: true },
    }));
  },

  toggleRecording: (started: boolean) => {
    set(state => ({
      recordingState: {
        ...state.recordingState,
        started,
      },
    }));
  },

  stopRecording: () => {
    set(state => ({
      recordingState: {
        ...state.recordingState,
        inProgress: false,
        processing: true,
      },
    }));
  },

  updateRecordings: recording => {
    set(state => ({
      recordings: [...state.recordings, recording],
      newRecording: recording,
      recordingState: {
        ...state.recordingState,
        processing: false,
      },
    }));
  },

  setRecordings: recordings => {
    set(state => ({
      ...state,
      recordings,
    }));
  },

  endRecording: () => {
    set(state => ({
      recordingState: {
        ...state.recordingState,
        inProgress: false,
        processing: false,
      },
    }));
  },

  removeNewrecording: () => {
    set(() => ({ newRecording: null }));
  },
});

export default createRecordingSlice;
