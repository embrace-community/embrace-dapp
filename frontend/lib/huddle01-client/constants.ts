import { RtpEncodingParameters } from 'mediasoup-client/lib/RtpParameters';

export const VIDEO_CONSTRAINS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }],
};
export const WEBCAM_SIMULCAST_ENCODINGS: RtpEncodingParameters[] = [
  {
    scaleResolutionDownBy: 4,
    maxBitrate: 300000, // 300kbps
    rid: 'r0',
    scalabilityMode: 'S1T3',
  },
  {
    scaleResolutionDownBy: 2,
    maxBitrate: 600000, // 600kbps
    rid: 'r1',
    scalabilityMode: 'S1T3',
  },
  {
    scaleResolutionDownBy: 1,
    maxBitrate: 9000000, // 900kbps
    rid: 'r2',
    scalabilityMode: 'S1T3',
  },
];

export const WEBCAM_KSVC_ENCODINGS = [{ scalabilityMode: 'S3T3_KEY' }];

export const SCREEN_SHARING_SIMULCAST_ENCODINGS = [
  { dtx: true, maxBitrate: 1500000 },
  { dtx: true, maxBitrate: 6000000 },
];

export const SCREEN_SHARING_SVC_ENCODINGS = [
  { scalabilityMode: 'S3T3', dtx: true },
];
