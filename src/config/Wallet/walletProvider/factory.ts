import { LocalStorageWalletProvider } from './localStorage';

export class WalletProviderFactory {
  static getProvider(type: string, args: any) {
    if (type === 'local') {
      return new LocalStorageWalletProvider(args);
    }
  }
}
