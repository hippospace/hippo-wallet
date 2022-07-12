import { AptosAccount, HexString } from 'aptos';

export type AptosAccountState = AptosAccount | undefined;

export type ActiveAptosWallet = HexString | undefined;

export interface AptosWalletAccount {
  walletName: string;
  address?: string;
  aptosAccount?: AptosAccountState;
  isAccountRemoved?: boolean;
}

export type WalletNameObject = Record<number, { walletName: string }>;

export type AptosImportedWalletObject = {
  // name: string;
  ciphertext: string;
  nonce: string;
};

export enum MessageMethod {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  GET_ACCOUNT_ADDRESS = 'getAccountAddress',
  IS_CONNECTED = 'is_connected',
  SIGN_AND_SUBMIT_TRANSACTION = 'signAndSubmitTransaction',
  SIGN_TRANSACTION = 'signTransaction'
}

export interface GetAccountResourcesProps {
  address?: string;
  nodeUrl?: string;
}
