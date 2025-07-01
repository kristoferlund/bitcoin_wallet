import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type AddressResult = { 'Ok' : string } |
  { 'Err' : string };
export type BalanceResult = { 'Ok' : bigint } |
  { 'Err' : string };
export type BitcoinAddress = string;
export type Network = { 'mainnet' : null } |
  { 'regtest' : null } |
  { 'testnet' : null };
export type Satoshi = bigint;
export type SendResult = { 'Ok' : string } |
  { 'Err' : string };
export interface _SERVICE {
  'get_address' : ActorMethod<[[] | [Principal]], AddressResult>,
  'get_balance' : ActorMethod<[[] | [Principal]], BalanceResult>,
  'send_btc' : ActorMethod<[BitcoinAddress, Satoshi], SendResult>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
