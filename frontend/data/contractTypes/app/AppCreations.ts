/* Autogenerated file. Do not edit manually. */

/* tslint:disable */

/* eslint-disable */
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";

export declare namespace AppCreations {
  export type CollectionStruct = {
    id: PromiseOrValue<BigNumberish>;
    contractAddress: PromiseOrValue<string>;
    name: PromiseOrValue<string>;
  };

  export type CollectionStructOutput = [BigNumber, string, string] & {
    id: BigNumber;
    contractAddress: string;
    name: string;
  };
}

export interface AppCreationsInterface extends utils.Interface {
  functions: {
    "createCollection(uint256,string,string)": FunctionFragment;
    "embraceSpacesAddress()": FunctionFragment;
    "getCollection(uint256,uint128)": FunctionFragment;
    "getCollectionCount(uint256)": FunctionFragment;
    "getCollections(uint256)": FunctionFragment;
    "isAdminExternal(uint256,address)": FunctionFragment;
    "isFounderExternal(uint256,address)": FunctionFragment;
    "spaceCollections(uint256,uint256)": FunctionFragment;
    "spaceToCollectionCount(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "createCollection"
      | "embraceSpacesAddress"
      | "getCollection"
      | "getCollectionCount"
      | "getCollections"
      | "isAdminExternal"
      | "isFounderExternal"
      | "spaceCollections"
      | "spaceToCollectionCount"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "createCollection",
    values: [
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "embraceSpacesAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCollection",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getCollectionCount",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getCollections",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "isAdminExternal",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "isFounderExternal",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "spaceCollections",
    values: [PromiseOrValue<BigNumberish>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "spaceToCollectionCount",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "createCollection",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "embraceSpacesAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollection",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollectionCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollections",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAdminExternal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isFounderExternal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "spaceCollections",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "spaceToCollectionCount",
    data: BytesLike
  ): Result;

  events: {
    "CollectionCreated(uint256,address,tuple)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "CollectionCreated"): EventFragment;
}

export interface CollectionCreatedEventObject {
  spaceId: BigNumber;
  creator: string;
  collection: AppCreations.CollectionStructOutput;
}
export type CollectionCreatedEvent = TypedEvent<
  [BigNumber, string, AppCreations.CollectionStructOutput],
  CollectionCreatedEventObject
>;

export type CollectionCreatedEventFilter =
  TypedEventFilter<CollectionCreatedEvent>;

export interface AppCreations extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AppCreationsInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    createCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    embraceSpacesAddress(overrides?: CallOverrides): Promise<[string]>;

    getCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[AppCreations.CollectionStructOutput]>;

    getCollectionCount(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getCollections(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[AppCreations.CollectionStructOutput[]]>;

    isAdminExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isFounderExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    spaceCollections(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string] & {
        id: BigNumber;
        contractAddress: string;
        name: string;
      }
    >;

    spaceToCollectionCount(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  createCollection(
    _spaceId: PromiseOrValue<BigNumberish>,
    _name: PromiseOrValue<string>,
    _symbol: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  embraceSpacesAddress(overrides?: CallOverrides): Promise<string>;

  getCollection(
    _spaceId: PromiseOrValue<BigNumberish>,
    _id: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<AppCreations.CollectionStructOutput>;

  getCollectionCount(
    _spaceId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getCollections(
    _spaceId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<AppCreations.CollectionStructOutput[]>;

  isAdminExternal(
    _spaceId: PromiseOrValue<BigNumberish>,
    _address: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isFounderExternal(
    _spaceId: PromiseOrValue<BigNumberish>,
    _address: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  spaceCollections(
    arg0: PromiseOrValue<BigNumberish>,
    arg1: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, string, string] & {
      id: BigNumber;
      contractAddress: string;
      name: string;
    }
  >;

  spaceToCollectionCount(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    createCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    embraceSpacesAddress(overrides?: CallOverrides): Promise<string>;

    getCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<AppCreations.CollectionStructOutput>;

    getCollectionCount(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCollections(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<AppCreations.CollectionStructOutput[]>;

    isAdminExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isFounderExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    spaceCollections(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string] & {
        id: BigNumber;
        contractAddress: string;
        name: string;
      }
    >;

    spaceToCollectionCount(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {
    "CollectionCreated(uint256,address,tuple)"(
      spaceId?: PromiseOrValue<BigNumberish> | null,
      creator?: PromiseOrValue<string> | null,
      collection?: null
    ): CollectionCreatedEventFilter;
    CollectionCreated(
      spaceId?: PromiseOrValue<BigNumberish> | null,
      creator?: PromiseOrValue<string> | null,
      collection?: null
    ): CollectionCreatedEventFilter;
  };

  estimateGas: {
    createCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    embraceSpacesAddress(overrides?: CallOverrides): Promise<BigNumber>;

    getCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCollectionCount(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getCollections(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isAdminExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isFounderExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    spaceCollections(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    spaceToCollectionCount(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    createCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _name: PromiseOrValue<string>,
      _symbol: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    embraceSpacesAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCollection(
      _spaceId: PromiseOrValue<BigNumberish>,
      _id: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCollectionCount(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCollections(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isAdminExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isFounderExternal(
      _spaceId: PromiseOrValue<BigNumberish>,
      _address: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    spaceCollections(
      arg0: PromiseOrValue<BigNumberish>,
      arg1: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    spaceToCollectionCount(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
