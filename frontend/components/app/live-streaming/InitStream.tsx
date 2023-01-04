import { useCreateStream, useUpdateStream } from "@livepeer/react";
import { Client } from "@livepeer/webrtmp-sdk";
import classNames from "classnames";
import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import { setLiveStream } from "../../../store/slices/live-streaming";
import Icons from "../../Icons";

export function InitStream({ query, space, streamName }) {
  const dispatch = useAppDispatch();

  const {
    mutate: createStream,
    data: streamData,
    status: streamStatus,
  } = useCreateStream({ name: streamName });

  // const {
  //   mutate: updateStream,
  //   status,
  //   error,
  // } = useUpdateStream({
  //   streamId: streamData?.id!,
  //   record: true,
  //   playbackPolicy: {
  //     type: "jwt",
  //   }
  // });

  // Create stream calling createStream() from useCreateStream hook
  async function triggerCreateStream() {
    if (!createStream) return;

    try {
      createStream();
      console.log("Live streaming: creating stream");
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  }

  // Once createStream() is called, streamData is set which triggers this useEffect
  useEffect(() => {
    if (!streamData) return;

    const initStream = async () => {
      // Set stream to store
      console.log("Live streaming: saving stream data to store", streamName, {
        data: streamData,
      });

      // Save LivePeer stream data to store
      dispatch(
        setLiveStream({
          streamName,
          liveStream: {
            data: streamData,
            status: streamStatus,
          },
        }),
      );
    };

    initStream();
  }, [dispatch, streamStatus, streamData, streamName]);

  useEffect(() => {
    if (!streamData) return;

    console.log("Stream data", streamData);
  }, [streamData]);

  return (
    <>
      <div className="w-full flex flex-col items-center mt-10">
        <button
          onClick={triggerCreateStream}
          className={classNames({
            "rounded-full border-embrace-dark border-2 bg-transparent text-embrace-dark text-sm font-semibold py-2 pl-5 pr-6 flex flex-row items-center":
              true,
          })}
        >
          <Icons.Video className="mr-2" /> Start Stream
        </button>
      </div>
    </>
  );
}
