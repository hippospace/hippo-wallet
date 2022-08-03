import pbkdf2 from 'pbkdf2';
import { Buffer } from 'buffer';
import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';
import * as bip32 from 'bip32';
import { LOCKED_CREDENTIAL, UNLOCKED_CREDENTIAL } from 'config/aptosConstants';
import EventEmitter from 'events';
import { useEffect, useState } from 'react';
import { isExtension } from './utility';

export const DERIVATION_PATH = {
  deprecated: undefined,
  bip44: 'bip44',
  bip44Change: 'bip44Change',
  bip44Root: 'bip44Root' // Ledger only.
};
export interface MnemonicAndSeed {
  mnemonic: string;
  seed: string;
}

const deriveEncryptionKey = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string
): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    pbkdf2.pbkdf2(password, salt, iterations, secretbox.keyLength, digest, (err, key) =>
      err ? reject(err) : resolve(key)
    );
  });
};

// Returns the 32 byte key used to encrypt imported private keys.
const deriveImportsEncryptionKey = (seed: string) => {
  // SLIP16 derivation path.
  return bip32.fromSeed(Buffer.from(seed, 'hex')).derivePath("m/10016'/0").privateKey;
};

async function getExtensionUnlockedMnemonic() {
  if (!isExtension) {
    return null;
  }

  return new Promise((resolve: (value: string) => void) => {
    chrome.runtime.sendMessage(
      {
        channel: 'hippo_extension_mnemonic_channel',
        method: 'get'
      },
      resolve
    );
  });
}

const EMPTY_MNEMONIC = {
  mnemonic: null,
  seed: null,
  importsEncryptionKey: null,
  derivationPath: null
};

export const loadingStoredData = async () => {
  return JSON.parse(
    (await getExtensionUnlockedMnemonic()) ||
      sessionStorage.getItem(UNLOCKED_CREDENTIAL) ||
      localStorage.getItem(UNLOCKED_CREDENTIAL) ||
      'null'
  );
};

let unlockedMnemonicAndSeed = (async () => {
  const unlockedExpiration = localStorage.getItem('unlockedExpiration');
  // Left here to clean up stored mnemonics from previous method
  if (unlockedExpiration && Number(unlockedExpiration) < Date.now()) {
    localStorage.removeItem(UNLOCKED_CREDENTIAL);
    localStorage.removeItem('unlockedExpiration');
  }
  const stored = await loadingStoredData();
  if (stored === null) {
    return EMPTY_MNEMONIC;
  }
  // console.log('check unlockedMnemonicAndSeed', stored);
  return {
    importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
    ...stored
  };
})();

export const walletSeedChanged = new EventEmitter();

export function useUnlockedMnemonicAndSeed() {
  const [currentUnlockedMnemonic, setCurrentUnlockedMnemonic] = useState(null);

  useEffect(() => {
    walletSeedChanged.addListener('change', setCurrentUnlockedMnemonic);
    unlockedMnemonicAndSeed.then(setCurrentUnlockedMnemonic);
    return () => {
      walletSeedChanged.removeListener('change', setCurrentUnlockedMnemonic);
    };
  }, []);

  return !currentUnlockedMnemonic
    ? { mnemonic: EMPTY_MNEMONIC, loading: true }
    : { mnemonic: currentUnlockedMnemonic, loading: false };
}

export const getUnlockedMnemonicAndSeed = () => {
  return unlockedMnemonicAndSeed;
};

const setUnlockedMnemonicAndSeed = (
  mnemonic?: string,
  seed?: string,
  importsEncryptionKey?: Buffer | undefined,
  derivationPath?: string
) => {
  const data = {
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath
  };
  unlockedMnemonicAndSeed = Promise.resolve(data);
  walletSeedChanged.emit('change', data);
};

export const generateMnemonicAndSeed = async (): Promise<MnemonicAndSeed> => {
  const bip39 = await import('bip39');
  const mnemonic = bip39.generateMnemonic(128);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString('hex') };
};

export const storeMnemonicAndSeed = async (
  mnemonic: string,
  seed: string,
  password: string,
  derivationPath: string
) => {
  const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });
  if (password) {
    const salt = randomBytes(16);
    const kdf = 'pbkdf2';
    const iterations = 100000;
    const digest = 'sha256';
    const key = await deriveEncryptionKey(password, salt, iterations, digest);
    const nonce = randomBytes(secretbox.nonceLength);
    const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
    localStorage.setItem(
      LOCKED_CREDENTIAL,
      JSON.stringify({
        encrypted: bs58.encode(encrypted),
        nonce: bs58.encode(nonce),
        kdf,
        salt: bs58.encode(salt),
        iterations,
        digest
      })
    );
    localStorage.removeItem(UNLOCKED_CREDENTIAL);
    // localStorage.setItem(UNLOCKED_CREDENTIAL, plaintext);
    sessionStorage.setItem(UNLOCKED_CREDENTIAL, plaintext);
  } else {
    localStorage.setItem(UNLOCKED_CREDENTIAL, plaintext);
    localStorage.removeItem(LOCKED_CREDENTIAL);
  }
  if (isExtension) {
    chrome.runtime.sendMessage({
      channel: 'hippo_extension_mnemonic_channel',
      method: 'set',
      data: plaintext
    });
  }
  // sessionStorage.removeItem(UNLOCKED_CREDENTIAL);
  // sessionStorage.setItem(UNLOCKED_CREDENTIAL, plaintext);

  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(mnemonic, seed, importsEncryptionKey, derivationPath);
};

export function useHasLockedMnemonicAndSeed() {
  const { mnemonic: unlockedMnemonic, loading } = useUnlockedMnemonicAndSeed();
  return [!unlockedMnemonic.seed && !!localStorage.getItem(LOCKED_CREDENTIAL), loading];
}

export const loadMnemonicAndSeed = async (password: string, stayLoggedIn?: boolean) => {
  const lockedCrendential = localStorage.getItem(LOCKED_CREDENTIAL) || '';
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest
  } = JSON.parse(lockedCrendential);
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext);
  if (stayLoggedIn) {
    if (isExtension) {
      chrome.runtime.sendMessage({
        channel: 'hippo_extension_mnemonic_channel',
        method: 'set',
        data: decodedPlaintext
      });
    } else {
      sessionStorage.setItem(UNLOCKED_CREDENTIAL, decodedPlaintext);
    }
  }
  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(mnemonic, seed, importsEncryptionKey, derivationPath);
  return { mnemonic, seed, derivationPath };
};

export const updateMnemonicAndSeed = async (currentPassword: string, newPassword: string) => {
  const lockedCrendential = localStorage.getItem(LOCKED_CREDENTIAL) || '';
  if (!lockedCrendential) {
    throw new Error('Some issues happened. Please contact dev team.');
  }
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest
  } = JSON.parse(lockedCrendential);
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(currentPassword, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }
  const newSalt = randomBytes(16);
  const newKdf = 'pbkdf2';
  const newIterations = 100000;
  const newDigest = 'sha256';
  const newKey = await deriveEncryptionKey(newPassword, newSalt, newIterations, newDigest);
  const newNonce = randomBytes(secretbox.nonceLength);
  const newEncrypted = secretbox(Buffer.from(plaintext), newNonce, newKey);
  localStorage.setItem(
    LOCKED_CREDENTIAL,
    JSON.stringify({
      encrypted: bs58.encode(newEncrypted),
      nonce: bs58.encode(newNonce),
      kdf: newKdf,
      salt: bs58.encode(newSalt),
      iterations: newIterations,
      digest: newDigest
    })
  );
  localStorage.removeItem(UNLOCKED_CREDENTIAL);
  sessionStorage.removeItem(UNLOCKED_CREDENTIAL);
  // chrome.runtime.sendMessage({
  //   channel: 'hippo_extension_mnemonic_channel',
  //   method: 'set',
  //   data: ''
  // });
};

export const logoutAccount = () => {
  sessionStorage.removeItem(UNLOCKED_CREDENTIAL);
  setUnlockedMnemonicAndSeed();
};

export function forgetWallet() {
  localStorage.clear();
  sessionStorage.removeItem(UNLOCKED_CREDENTIAL);
  unlockedMnemonicAndSeed = Promise.resolve({
    mnemonic: null,
    seed: null,
    importsEncryptionKey: null
  });
  walletSeedChanged.emit('change', unlockedMnemonicAndSeed);
}

export async function mnemonicToSeed(mnemonic: string) {
  const bip39 = await import('bip39');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString('hex');
}

export function normalizeMnemonic(mnemonic: string) {
  return mnemonic.trim().split(/\s+/g).join(' ');
}

export const DerivationPathMenuItem = {
  Deprecated: 0,
  Bip44: 1,
  Bip44Change: 2,
  Bip44Root: 3 // Ledger only.
};

export const toDerivationPath = (dPathMenuItem: number) => {
  switch (dPathMenuItem) {
    case DerivationPathMenuItem.Deprecated:
      return DERIVATION_PATH.deprecated;
    case DerivationPathMenuItem.Bip44:
      return DERIVATION_PATH.bip44;
    case DerivationPathMenuItem.Bip44Change:
      return DERIVATION_PATH.bip44Change;
    case DerivationPathMenuItem.Bip44Root:
      return DERIVATION_PATH.bip44Root;
    default:
      throw new Error(`invalid derivation path: ${dPathMenuItem}`);
  }
};
