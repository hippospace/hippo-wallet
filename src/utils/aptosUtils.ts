import { AptosAccount } from 'aptos';
import { Buffer } from 'buffer';
import {
  APTOS_IMPORTED_WALLET_LIST,
  WALLET_NAME_LIST,
  ENCRYPTED_WALLET_LIST,
  WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY
} from 'config/aptosConstants';
import { AptosImportedWalletObject, WalletNameObject } from 'types/aptos';

export function createNewAccount(): AptosAccount {
  const account = new AptosAccount();
  // todo: make request to create account on chain
  return account;
}

export function importAccount(key: string): AptosAccount {
  try {
    const nonHexKey = key.startsWith('0x') ? key.substring(2) : key;
    const encodedKey = Uint8Array.from(Buffer.from(nonHexKey, 'hex'));
    const account = new AptosAccount(encodedKey, undefined);
    return account;
  } catch (error) {
    throw error;
  }
}

export function getEncryptedLocalState(): string | null {
  const item = window.localStorage.getItem(ENCRYPTED_WALLET_LIST);
  return item;
}

export const getAptosWalletList = () => {
  let item = window.localStorage.getItem(WALLET_NAME_LIST);
  if (item) {
    return JSON.parse(item) as WalletNameObject;
  }
  return {} as WalletNameObject;
};

export const getPrivateKeyImports = () => {
  let item = window.localStorage.getItem(APTOS_IMPORTED_WALLET_LIST);
  if (item) {
    return JSON.parse(item) as Record<string, AptosImportedWalletObject>;
  }
  return {} as Record<string, AptosImportedWalletObject>;
};

export const storePrivateKeyImports = (item: Record<string, AptosImportedWalletObject>) => {
  window.localStorage.setItem(APTOS_IMPORTED_WALLET_LIST, JSON.stringify(item));
};

export const setWalletNameList = (walletList: WalletNameObject) => {
  window.localStorage.setItem(WALLET_NAME_LIST, JSON.stringify(walletList));
};

export type AptosNetwork = 'http://0.0.0.0:8080' | 'https://fullnode.devnet.aptoslabs.com';

export function getLocalStorageNetworkState(): AptosNetwork | null {
  // Get network from local storage by key
  return window.localStorage.getItem(WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY) as AptosNetwork | null;
}

function connect(account, sendResponse) {
  // todo: register caller for permission checking purposes
  getAccountAddress(account, sendResponse);
}

function disconnect() {
  // todo: unregister caller
}

function isConnected(sendResponse) {
  // todo: send boolean response based on registered caller
  sendResponse(true);
}

function getAccountAddress(account, sendResponse) {
  if (account.address()) {
    sendResponse({ address: account.address().hex() });
  } else {
    sendResponse({ error: 'No accounts signed in' });
  }
}

async function signAndSubmitTransaction(client, account, transaction, sendResponse) {
  try {
    const signedTransaction = signTransaction(client, account, transaction);
    const response = await client.submitTransaction(account, signedTransaction);
    sendResponse(response);
  } catch (error) {
    sendResponse({ error });
  }
}

async function signTransactionAndSendResponse(client, account, transaction, sendResponse) {
  try {
    const signedTransaction = signTransaction(client, account, transaction);
    sendResponse({ signedTransaction });
  } catch (error) {
    sendResponse({ error });
  }
}

async function signTransaction(client, account, transaction) {
  const address = account.address();
  const txn = await client.generateTransaction(address, transaction);
  return await client.signTransaction(account, txn);
}
