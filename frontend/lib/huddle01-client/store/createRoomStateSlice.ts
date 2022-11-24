import { IDropReason, IRoomStateStoreType, StoreSlice } from './storeTypes';

const createRoomStateSlice: StoreSlice<IRoomStateStoreType> = (set, get) => ({
  roomState: {
    roomId: '',
    joined: false,
    droppedState: {
      type: 'not-joined',
      isDropped: false,
    },
    createdAt: 0,
    isRoomLocked: false,
  },

  setRoomLockState: (isRoomLocked: boolean) => {
    const prevRoomState = get().roomState;
    set(() => ({
      roomState: {
        ...prevRoomState,
        isRoomLocked,
      },
    }));
  },

  setRoomId: (roomId: string) => {
    const prevRoomState = get().roomState;
    set(() => ({
      roomState: {
        ...prevRoomState,
        roomId,
      },
    }));
  },

  setJoined: () => {
    const prevRoomState = get().roomState;
    set(() => ({
      roomState: {
        ...prevRoomState,
        joined: true,
      },
    }));
  },

  setCreatedAt: (createdAt: number) => {
    const prevRoomState = get().roomState;
    set(() => ({
      roomState: {
        ...prevRoomState,
        createdAt,
      },
    }));
  },

  setDropState: (dropReason: IDropReason) => {
    const prevRoomState = get().roomState;
    set(() => ({
      roomState: {
        roomId: prevRoomState.roomId,
        joined: false,
        droppedState: {
          type: dropReason,
          isDropped: true,
        },
        createdAt: prevRoomState.createdAt,
        isRoomLocked: prevRoomState.isRoomLocked,
      },
    }));
  },
});

export default createRoomStateSlice;
