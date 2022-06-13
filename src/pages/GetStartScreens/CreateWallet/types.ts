import { MnemonicAndSeed } from 'utils/wallet-seed';

export interface FormValues {
  mnemonicAndSeed?: MnemonicAndSeed;
  walletName: string;
  password: string;
  confirmPassword: string;
  copied: boolean;
  understood: boolean;
  agree: boolean;
}
