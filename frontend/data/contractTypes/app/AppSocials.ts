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

export declare namespace AppSocials {
  export type SocialStruct = {
    id: PromiseOrValue<BigNumberish>;
    lensWallet: PromiseOrValue<string>;
    lensDefaultProfileId: PromiseOrValue<string>;
  };

  export type SocialStructOutput = [BigNumber, string, string] & {
    id: BigNumber;
    lensWallet: string;
    lensDefaultProfileId: string;
  };
}

export interface AppSocialsInterface extends utils.Interface {
  functions: {
    "createSocial(uint256,address,string)": FunctionFragment;
    "embraceSpacesAddress()": FunctionFragment;
    "getSocial(uint256)": FunctionFragment;
    "isAdminExternal(uint256,address)": FunctionFragment;
    "isFounderExternal(uint256,address)": FunctionFragment;
    "spaceSocials(uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "createSocial"
      | "embraceSpacesAddress"
      | "getSocial"
      | "isAdminExternal"
      | "isFounderExternal"
      | "spaceSocials"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "createSocial",
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
    functionFragment: "getSocial",
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
    functionFragment: "spaceSocials",
    values: [PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "createSocial",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "embraceSpacesAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getSocial", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isAdminExternal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isFounderExternal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "spaceSocials",
    data: BytesLike
  ): Result;

  events: {
    "SocialCreated(uint256,address,address,string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "SocialCreated"): EventFragment;
}

export interface SocialCreatedEventObject {
  spaceId: BigNumber;
  creator: string;
  lensWallet: string;
  lensDefaultProfileId: string;
}
export type SocialCreatedEvent = TypedEvent<
  [BigNumber, string, string, string],
  SocialCreatedEventObject
>;

export type SocialCreatedEventFilter = TypedEventFilter<SocialCreatedEvent>;

export interface AppSocials extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AppSocialsInterface;

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
    createSocial(
      _spaceId: PromiseOrValue<BigNumberish>,
      _lensWallet: PromiseOrValue<string>,
      _lensDefaultProfileId: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    embraceSpacesAddress(overrides?: CallOverrides): Promise<[string]>;

    getSocial(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[AppSocials.SocialStructOutput]>;

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

    spaceSocials(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string] & {
        id: BigNumber;
        lensWallet: string;
        lensDefaultProfileId: string;
      }
    >;
  };

  createSocial(
    _spaceId: PromiseOrValue<BigNumberish>,
    _lensWallet: PromiseOrValue<string>,
    _lensDefaultProfileId: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  embraceSpacesAddress(overrides?: CallOverrides): Promise<string>;

  getSocial(
    _spaceId: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<AppSocials.SocialStructOutput>;

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

  spaceSocials(
    arg0: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<
    [BigNumber, string, string] & {
      id: BigNumber;
      lensWallet: string;
      lensDefaultProfileId: string;
    }
  >;

  callStatic: {
    createSocial(
      _spaceId: PromiseOrValue<BigNumberish>,
      _lensWallet: PromiseOrValue<string>,
      _lensDefaultProfileId: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    embraceSpacesAddress(overrides?: CallOverrides): Promise<string>;

    getSocial(
      _spaceId: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<AppSocials.SocialStructOutput>;

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

    spaceSocials(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string, string] & {
        id: BigNumber;
        lensWallet: string;
        lensDefaultProfileId: string;
      }
    >;
  };

  filters: {
    "SocialCreated(uint256,address,address,string)"(
      spaceId?: PromiseOrValue<BigNumberish> | null,
      creator?: PromiseOrValue<string> | null,
      lensWallet?: null,
      lensDefaultProfileId?: PromiseOrValue<string> | null
    ): SocialCreatedEventFilter;
    SocialCreated(
      spaceId?: PromiseOrValue<BigNumberish> | null,
      creator?: PromiseOrValue<string> | null,
      lensWallet?: null,
      lensDefaultProfileId?: PromiseOrValue<string> | null
    ): SocialCreatedEventFilter;
  };

  estimateGas: {
    createSocial(
      _spaceId: PromiseOrValue<BigNumberish>,
      _lensWallet: PromiseOrValue<string>,
      _lensDefaultProfileId: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    embraceSpacesAddress(overrides?: CallOverrides): Promise<BigNumber>;

    getSocial(
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

    spaceSocials(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    createSocial(
      _spaceId: PromiseOrValue<BigNumberish>,
      _lensWallet: PromiseOrValue<string>,
      _lensDefaultProfileId: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    embraceSpacesAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getSocial(
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

    spaceSocials(
      arg0: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}