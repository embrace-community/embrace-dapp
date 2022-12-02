import logger from "../HuddleClient/logger";

let figment: any;

export const initFigment = async (
  stream: MediaStream
): Promise<MediaStream> => {
  if (figment && figment.isActive()) {
    logger.info({
      type: "error",
      msg: "initFigment() | Figment is already active",
    });
    return stream;
  }

  figment = new (window as any).FigmentApp({
    customerKey: "d41d8cd98f00b204e9800998ecf8427e",
  });

  const outputFigmentTrack: MediaStream = await figment.activate({
    activeApp: "VB",
    vbQuality: "performance",
    inputMediaStream: {
      mediaStream: stream,
      stopTracksOnDestruction: true,
    },
  });

  logger.info({
    type: "info",
    msg: "initFigment() | Figment is activated",
  });

  return outputFigmentTrack;
};

export const changeFigBg = async (
  type: "blur" | "image",
  bgImgUrl?: string
) => {
  if (!figment) {
    logger.error({
      type: "error",
      msg: "changeFigBg() | Figment is not initialized",
    });
    return;
  }
  if (!figment.isActive()) {
    logger.error({
      type: "error",
      msg: "changeFigBg() | Figment is not active",
    });
    return;
  }

  if (type === "image" && !bgImgUrl) {
    logger.error({
      type: "error",
      msg: " changeFigBg | bgImageUrl is required",
    });
    return;
  }

  try {
    if (type === "blur") {
      figment.setOption("blur_background", "balanced");
    } else if (type === "image") {
      logger.info({
        type: "info",
        msg: "changeFigBg() | Changing background image",
      });
      figment.setOption("set_background_img", bgImgUrl);
    }
  } catch (err) {
    logger.error(err);
  }
};

export const saveFigmentinLocalStorage = (
  type: "blur" | "image",
  bgImgUrl?: string
) => {
  const figmentObj = {
    type,
    bgImgUrl: bgImgUrl || "",
  };
  localStorage.setItem("huddle-figment", JSON.stringify(figmentObj));
};

export const disableFigment = async () => {
  try {
    if (figment) {
      if (figment.isActive()) {
        await figment.deactivate();
      }
    }
  } catch (err) {
    logger.error(err);
  }
};
