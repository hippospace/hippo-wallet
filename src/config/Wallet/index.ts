import { WalletProviderFactory } from './walletProvider/factory';

export class Wallet {
  connection;
  type;
  provider;

  constructor(connection: string, type: string, args: any) {
    this.connection = connection;
    this.type = type;
    this.provider = WalletProviderFactory.getProvider(type, args);
  }

  static create = async (connection: string, type: string, args: any) => {
    const instance = new Wallet(connection, type, args);
    await instance.provider?.init();
    return instance;
  };
}
