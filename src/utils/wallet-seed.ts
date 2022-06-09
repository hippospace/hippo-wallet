import pbkdf2 from 'pbkdf2';
import { Buffer } from 'buffer';
import { randomBytes, secretbox } from 'tweetnacl';
import bs58 from 'bs58';
import * as bip32 from 'bip32';
import { LOCKED_CREDENTIAL, UNLOCKED_CREDENTIAL } from 'config/aptosConstants';
import EventEmitter from 'events';
import { useEffect, useState } from 'react';

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
    // console.log('MEME>>', password, salt, iterations, digest, resolve, reject);
    // new Uint8Array();
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

const EMPTY_MNEMONIC = {
  mnemonic: null,
  seed: null,
  importsEncryptionKey: null,
  derivationPath: null
};

let unlockedMnemonicAndSeed = (async () => {
  const unlockedExpiration = localStorage.getItem('unlockedExpiration');
  // Left here to clean up stored mnemonics from previous method
  if (unlockedExpiration && Number(unlockedExpiration) < Date.now()) {
    localStorage.removeItem('unlocked');
    localStorage.removeItem('unlockedExpiration');
  }
  const stored = JSON.parse(
    sessionStorage.getItem('unlocked') || localStorage.getItem('unlocked') || 'null'
  );
  if (stored === null) {
    return EMPTY_MNEMONIC;
  }
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

function setUnlockedMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  importsEncryptionKey: Buffer | undefined,
  derivationPath: string
) {
  const data = {
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath
  };
  unlockedMnemonicAndSeed = Promise.resolve(data);
  walletSeedChanged.emit('change', data);
}

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
  } else {
    localStorage.setItem(UNLOCKED_CREDENTIAL, plaintext);
    localStorage.removeItem(LOCKED_CREDENTIAL);
  }
  sessionStorage.removeItem(UNLOCKED_CREDENTIAL);

  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(mnemonic, seed, importsEncryptionKey, derivationPath);
};
