import { AptosAccount, HexString } from 'aptos';

export type AptosAccountState = AptosAccount | undefined;

export type ActiveAptosWallet = HexString | undefined;

export interface AptosWalletAccount {
  walletName: string;
  address?: string;
  aptosAccount?: AptosAccountState;
}

export type WalletNameObject = Record<number, { walletName: string }>;

export type AptosImportedWalletObject = {
  // name: string;
  ciphertext: string;
  nonce: string;
};

export const MessageMethod = Object.freeze({
  GET_ACCOUNT_ADDRESS: 'getAccountAddress',
  SIGN_TRANSACTION: 'signTransaction'
} as const);

export interface GetAccountResourcesProps {
  address?: string;
  nodeUrl?: string;
}
