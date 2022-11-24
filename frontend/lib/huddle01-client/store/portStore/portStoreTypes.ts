import { GetState, SetState } from 'zustand';
export type StoreSlice<T extends object, E extends object = T> = (
  set: SetState<E extends T ? E : E & T>,
  get: GetState<E extends T ? E : E & T>
) => T;

export interface ITestState {
  isTest: boolean;
  toggleIsTest: () => void;
}

export interface IPeerAudioState {
  peers: Set<string>;
  addPeerPort: (peer: string) => void;
  removePeerPort: (peer: string) => void;
}

export interface IViewPortState {
  isLastNActive: boolean;
  activeViewPortCount: number;
  activeViewPortIds: Set<string>;
  maxViewPortCount: number;

  activateLastN: () => void;
  deactivateLastN: () => void;
  getActiveViewPortIds: () => Set<string>;
  getSpaceLeftInViewport: () => number;
  setActiveViewPort: (activeViewPortIds: string[]) => void;
  addPeerViewPort: (peerId: string) => void;
  removePeerViewPort(peerId: string): void;
}

export type IPortState = ITestState & IPeerAudioState & IViewPortState;
