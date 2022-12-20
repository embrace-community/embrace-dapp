import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Client } from "@livepeer/webrtmp-sdk";
import { Stream } from "@livepeer/react";

type LiveStream = {
  // client: Client | null; // Live peer client
  data: Stream | null; // includes the stream key, playbackId etc
  // session?: any | null; // Session object from webRTC connection
  status?: "loading" | "success" | "idle" | "error" | null;
};

type LiveStreamObject = {
  [streamName: string]: LiveStream;
};

export interface LiveStreamingState {
  liveStreams: LiveStreamObject;
}

const initialState: LiveStreamingState = {
  liveStreams: {},
};

export const liveStreamingSlice = createSlice({
  name: "liveStreaming",
  initialState,
  reducers: {
    setLiveStream: (
      state,
      action: PayloadAction<{ streamName: string; liveStream: LiveStream }>,
    ) => {
      const { streamName, liveStream } = action.payload;

      state.liveStreams[streamName] = liveStream;
    },
    // setLiveStreamSession: (
    //   state,
    //   action: PayloadAction<{ streamName: string; session: any }>,
    // ) => {
    //   const { streamName, session } = action.payload;

    //   if (!state.liveStreams[streamName]) return;

    //   state.liveStreams[streamName]["session"] = session;
    // },
  },
});

export const { setLiveStream } = liveStreamingSlice.actions;

export const getLiveStream = createSelector(
  (state: RootState) => state.liveStreaming.liveStreams,
  (liveStreams: LiveStreamObject) => {
    return (streamName: string) => {
      return (
        liveStreams[streamName] ??
        ({
          client: null,
          data: null,
          session: null,
        } as LiveStream)
      );
    };
  },
);

export default liveStreamingSlice.reducer;
