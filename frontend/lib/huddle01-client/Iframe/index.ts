export const triggerIframeEvent = (event: string, data: any) => {
  window.parent.postMessage(
    { type: 'room-event', eventData: { event, ...data } },
    '*'
  );
};
