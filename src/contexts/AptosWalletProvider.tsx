import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import {
  ActiveAptosWallet,
  AptosAccountState,
  AptosImportedWalletObject,
  AptosWalletAccount,
  WalletNameObject
} from 'types/aptos';
import { UNLOCKED_CREDENTIAL, WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY } from 'config/aptosConstants';
import {
  AptosNetwork,
  createNewAccount,
  getAptosWalletList,
  getLocalStorageNetworkState,
  getPrivateKeyImports,
  setWalletNameList,
  storePrivateKeyImports
} from 'utils/aptosUtils';
import { logoutAccount, useUnlockedMnemonicAndSeed } from 'utils/wallet-seed';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { AptosAccount } from 'aptos';
import { faucetClient, aptosClient } from 'config/aptosClient';
import { useLocalStorage } from 'hooks/useLocalStorage';
import { isExtension } from 'utils/utility';

interface AptosWalletContextType {
  activeWallet?: AptosWalletAccount;
  aptosNetwork: AptosNetwork | null;
  disconnect: () => void;
  aptosWalletAccounts: AptosWalletAccount[];
  updateNetworkState: (network: AptosNetwork) => void;
  setWalletList: React.Dispatch<React.SetStateAction<WalletNameObject>>;
  walletList: Record<string, AptosImportedWalletObject>;
  addAccount: (walletName: string, importedAccount?: AptosAccount) => void;
  deleteAccount: (address: string) => void;
  updateAccountInfo: (address: string, walletName: string) => void;
  setActiveAptosWallet: (address?: string) => void;
}

interface TProviderProps {
  children: ReactNode;
}

const AptosWalletContext = createContext<AptosWalletContextType>({} as AptosWalletContextType);

const AptosWalletProvider: FC<TProviderProps> = ({ children }) => {
  const [privateKeyImports, setPrivateKeyImports] =
    useState<Record<string, AptosImportedWalletObject>>(getPrivateKeyImports);
  const [walletList, setWalletList] = useState<WalletNameObject>(getAptosWalletList);
  const [activeWallet, setActiveWallet] = useState<AptosWalletAccount | undefined>(undefined);
  const [aptosNetwork, setAptosNetwork] = useState<AptosNetwork | null>(() =>
    getLocalStorageNetworkState()
  );
  const { useLocalStorageState } = useLocalStorage();
  const [currentWallet, setCurrentWallet] = useLocalStorageState<ActiveAptosWallet>(
    'hippoActiveWallet',
    undefined,
    true
  );
  const {
    mnemonic: { seed, derivationPath, importsEncryptionKey }
  } = useUnlockedMnemonicAndSeed();
  const [aptosWalletAccounts, setAptosWalletAccounts] = useState<AptosWalletAccount[]>([]);

  const refreshAccounts = useCallback(async () => {
    let accounts = [{} as AptosWalletAccount];
    try {
      if (seed && derivationPath) {
        const importedAccountsPromise = await Promise.all(
          Object.keys(privateKeyImports).map(async (address, idx) => {
            const { ciphertext, nonce } = privateKeyImports[address];
            let aptosAccount = {} as AptosAccount;
            if (importsEncryptionKey) {
              const privateKey = nacl.secretbox.open(
                bs58.decode(ciphertext),
                bs58.decode(nonce),
                importsEncryptionKey
              );
              if (privateKey) {
                aptosAccount = new AptosAccount(privateKey);
              }
            }
            const wallet = walletList[idx];
            if (!wallet) {
              return {
                address: '',
                walletName: 'INVALID_WALLET_NAME_',
                aptosAccount
              };
            }

            let accountResource;
            try {
              accountResource = await aptosClient.getAccountResources(address);
            } catch (err) {
              console.log('get account resources:: ', err);
            }
            return {
              address: address,
              walletName: wallet.walletName,
              aptosAccount,
              isAccountRemoved: !accountResource
            };
          })
        );
        const importedAccounts = importedAccountsPromise.filter((w) => w.address != '');
        accounts = [...importedAccounts];
      }
    } catch (err) {
      console.log('refresh account resources:: ', err);
    } finally {
      setAptosWalletAccounts(accounts);
    }
  }, [derivationPath, importsEncryptionKey, privateKeyImports, seed, walletList]);

  useEffect(() => {
    refreshAccounts();
  }, [seed, derivationPath, privateKeyImports, importsEncryptionKey, walletList]);

  // Set the current selected Aptos wallet
  const setActiveAptosWallet = useCallback(
    async (address?: string) => {
      if (!aptosWalletAccounts || !aptosWalletAccounts.length)
        throw new Error('Please login first');
      let selectedWallet: AptosWalletAccount | undefined = aptosWalletAccounts[0];
      if (address) {
        selectedWallet = aptosWalletAccounts.find((wallet) => wallet.address === address);
      }
      if (!selectedWallet) throw new Error('Wallet not found');
      setActiveWallet(selectedWallet);
    },
    [setActiveWallet, aptosWalletAccounts]
  );

  // Add new account or import account from private key
  const addAccount = useCallback(
    async (walletName?: string, importedAccount?: AptosAccountState) => {
      if (importedAccount) {
        if (importsEncryptionKey) {
          const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
          const plaintext = importedAccount.signingKey.secretKey;
          const ciphertext = nacl.secretbox(plaintext, nonce, importsEncryptionKey);
          const privateObjKey = importedAccount.toPrivateKeyObject();
          let newPrivateKeyImports = { ...privateKeyImports };
          newPrivateKeyImports[privateObjKey.address || ''] = {
            ciphertext: bs58.encode(ciphertext),
            nonce: bs58.encode(nonce)
          };
          const numOfWalletList = Object.keys(walletList).length;
          if (walletName) {
            const updatedWalletList = { ...walletList, [numOfWalletList]: { walletName } };
            setWalletList(updatedWalletList);
            setWalletNameList(updatedWalletList);
          }
          storePrivateKeyImports(newPrivateKeyImports);
          setPrivateKeyImports(newPrivateKeyImports);
        }
      }
    },
    [importsEncryptionKey, privateKeyImports, walletList]
  );

  const loginAccount = useCallback(async () => {
    if (seed && derivationPath) {
      if (!privateKeyImports || !Object.keys(privateKeyImports).length) {
        // create new account when there is no other accounts imported
        const account = createNewAccount();
        await faucetClient.fundAccount(account.address(), 0);
        const newWalletAccount = walletList[0];
        const privateKeyObj = account?.toPrivateKeyObject();
        await addAccount(undefined, account);
        const selectedWallet = {
          ...newWalletAccount,
          address: privateKeyObj?.address,
          aptosAccount: account
        };
        setActiveWallet(selectedWallet);
        setWalletNameList(walletList);
      } else if (currentWallet?.toString() && !activeWallet?.address) {
        // login existing account
        setActiveAptosWallet(currentWallet?.toString());
      } else if (!currentWallet?.toString() && !activeWallet?.address) {
        setActiveAptosWallet();
      }
    }
  }, [
    seed,
    derivationPath,
    setActiveAptosWallet,
    privateKeyImports,
    addAccount,
    walletList,
    activeWallet?.address,
    currentWallet
  ]);

  useEffect(() => {
    // This is used to listen on any updates of Mnemonic/Seed when new account is created/login
    loginAccount();
  }, [aptosWalletAccounts, loginAccount, seed, derivationPath]);

  // Update wallet name
  const updateAccountInfo = useCallback(
    (address: string, walletName: string) => {
      const walletIdx = aptosWalletAccounts.findIndex((acc) => acc.address === address);
      const updatedWallets = { ...walletList, [walletIdx]: { walletName } };
      setWalletList(updatedWallets);
      setWalletNameList(updatedWallets);
    },
    [aptosWalletAccounts, walletList]
  );

  const deleteAccount = useCallback(
    async (address: string) => {
      const walletIdx = aptosWalletAccounts.findIndex((acc) => acc.address === address);
      const currentWallets = { ...walletList };
      delete currentWallets[walletIdx];
      const updatedWallets = { ...currentWallets };
      const selectedWallet: AptosWalletAccount | undefined = aptosWalletAccounts[0];
      setCurrentWallet(selectedWallet.address);
      let newPrivateKeyImports = { ...privateKeyImports };
      delete newPrivateKeyImports[address];
      storePrivateKeyImports(newPrivateKeyImports);
      setPrivateKeyImports(newPrivateKeyImports);
      setWalletList(updatedWallets);
      setWalletNameList(updatedWallets);
      setActiveAptosWallet(selectedWallet.address);
    },
    [aptosWalletAccounts, privateKeyImports, setActiveAptosWallet, setCurrentWallet, walletList]
  );

  useEffect(() => {
    if (window.parent && activeWallet?.aptosAccount) {
      const newWalletAddress = activeWallet?.aptosAccount.address();
      setCurrentWallet(newWalletAddress?.toString());
      window.parent.postMessage({ method: 'account', address: newWalletAddress }, '*');
    }
  }, [activeWallet]);

  const updateNetworkState = useCallback((network: AptosNetwork) => {
    try {
      setAptosNetwork(network);
      window.localStorage.setItem(WALLET_STATE_NETWORK_LOCAL_STORAGE_KEY, network);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }, []);

  const disconnect = useCallback(() => {
    logoutAccount();
    const newWalletAddress = undefined;
    setActiveWallet(newWalletAddress);
    sessionStorage.removeItem(UNLOCKED_CREDENTIAL);
    setCurrentWallet(null);
    window.parent.postMessage({ method: 'disconnected' }, '*');
    if (isExtension) {
      chrome.runtime.sendMessage({
        channel: 'hippo_extension_mnemonic_channel',
        method: 'set',
        data: ''
      });
    }
  }, [setCurrentWallet]);

  return (
    <AptosWalletContext.Provider
      value={{
        activeWallet,
        setActiveAptosWallet,
        addAccount,
        deleteAccount,
        aptosNetwork,
        disconnect,
        updateNetworkState,
        walletList: privateKeyImports,
        updateAccountInfo,
        setWalletList,
        aptosWalletAccounts
      }}>
      {children}
    </AptosWalletContext.Provider>
  );
};

export { AptosWalletProvider, AptosWalletContext };
