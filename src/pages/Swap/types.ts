import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8/TokenRegistry';

export interface ISwapSettings {
  slipTolerance: number;
  trasactionDeadline: number;
  currencyFrom?: {
    token: TokenInfo;
    amount?: number;
    balance: number;
  };
  currencyTo?: {
    token: TokenInfo;
    amount?: number;
    balance: number;
  };
}
