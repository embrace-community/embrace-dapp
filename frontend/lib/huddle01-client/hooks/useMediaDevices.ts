import { useEffect, useState } from 'react';

const useMediaDevices = (constraints?: MediaStreamConstraints) => {
  const [mediaStream, setMediaStream] = useState<{
    stream: MediaStream | null;
    error: string | null;
    loading: boolean;
  }>({
    stream: null,
    error: null,
    loading: true,
  });

  const { stream, loading } = mediaStream;

  const pauseTracks = () => {
    if (!stream) return;
    stream.getTracks().forEach(track => track.stop());
    setMediaStream({ ...mediaStream, stream: null });
  };

  const getMediaDevices = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices;
  };

  useEffect(() => {
    let isMounted = true;

    const enableStream = async () => {
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(_stream => {
          /* use the stream */
          if (isMounted)
            setMediaStream({ stream: _stream, error: null, loading: false });
        })
        .catch(_error => {
          if (isMounted)
            setMediaStream(prev => ({
              ...prev,
              error: _error,
              loading: false,
            }));
        });
    };

    if (!mediaStream) enableStream();

    return () => {
      isMounted = false;
      pauseTracks();
    };
  }, []);

  return {
    stream,
    loading,
    getMediaDevices,
    pauseTracks,
  };
};

export default useMediaDevices;
