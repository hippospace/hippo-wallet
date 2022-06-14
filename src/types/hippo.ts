import { AptosAccount } from 'aptos';
import { TransactionPayload } from 'aptos/dist/api/data-contracts';

// export interface UserTransactionRequest {
//   type: 'swap' | 'deposit' | 'withdraw';
//   payload: TransactionPayload;
// }

export type TTransaction = {
  type: 'swap' | 'deposit' | 'withdraw';
  payload: TransactionPayload;
  callback?: (aptosAccount: AptosAccount, trans: TTransaction) => void;
  transactionInfo: Record<string, string | number>;
};
