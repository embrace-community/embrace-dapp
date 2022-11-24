import {
  StoreSlice,
  IChatStoreType,
  IChatText,
  IChatErrorType,
  TNotifSounds,
} from './storeTypes';
import { randomId } from '../utils/helpers';

const createChatSlice: StoreSlice<IChatStoreType> = (set, get) => ({
  unread: {
    mainRoom: 0,
  },
  chat: {
    mainRoom: [],
  },
  reactions: {},
  sharedFilesArr: [],
  notificationSounds: '',
  chatNotif: true,
  peerJoinNotif: true,
  peerLeaveNotif: true,
  setchatNotif: (value: boolean) => set(() => ({ chatNotif: value })),
  setpeerJoinNotif: (value: boolean) => set(() => ({ peerJoinNotif: value })),
  setpeerLeaveNotif: (value: boolean) => set(() => ({ peerLeaveNotif: value })),
  setNotificationSounds: (notificationSounds: TNotifSounds) => {
    set(() => ({ notificationSounds }));
  },

  setChat: (chat: IChatText, toId: string, err?: IChatErrorType) => {
    const prevChats = get().chat[toId];
    const newChats = prevChats
      ? [
          ...prevChats,
          {
            ...chat,
            id: randomId(),
            error: err ? err.error : { isError: false },
          },
        ]
      : [
          {
            ...chat,
            id: randomId(),
            error: err ? err.error : { isError: false },
          },
        ];
    set(
      () => ({
        chat: {
          ...get().chat,
          [toId]: newChats,
        },
      }),
      false
    );
  },

  removeChat: (toId: string) => {
    const prevChats = get().chat;
    delete prevChats[toId];
    set(() => ({ chat: prevChats }));
  },

  increaseUnread: (chatRoomId: string) => {
    const unread = get().unread[chatRoomId] || 0;
    set(
      () => ({
        unread: {
          ...get().unread,
          [chatRoomId]: unread + 1,
        },
      }),
      false
    );
  },

  removeUnread: (chatRoomId: string) => {
    const prevUnread = get().unread;
    delete prevUnread[chatRoomId];
    set(() => ({
      unread: {
        ...get().unread,
        [chatRoomId]: 0,
      },
    }));
  },

  addSharedFile: sharedFile => {
    set(state => ({
      sharedFilesArr: [...state.sharedFilesArr, sharedFile],
    }));
  },
  setSharedFiles: sharedFiles => {
    set(() => ({
      sharedFilesArr: sharedFiles,
    }));
  },
});

export default createChatSlice;
