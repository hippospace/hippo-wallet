import { createContext, FC, ReactNode, useCallback, useEffect, useState } from 'react';
import { hippoSwapClient, hippoWalletClient } from 'config/hippoWalletClient';
import {
  HippoSwapClient,
  HippoWalletClient,
  PoolType,
  UITokenAmount,
  aptos_framework
} from '@manahippo/hippo-sdk';
import { coin_registry$_ } from '@manahippo/hippo-sdk/dist/generated/coin_registry';
import useAptosWallet from 'hooks/useAptosWallet';
import { aptosClient, faucetClient } from 'config/aptosClient';
import { sendPayloadTx } from 'utils/hippoWalletUtil';
import { message } from 'components/Antd';
import { TTransaction } from 'types/hippo';
import { walletAddressEllipsis } from 'utils/utility';
// import { UserTransactionRequest } from 'aptos/dist/api/data-contracts';

interface HippoClientContextType {
  hippoWallet?: HippoWalletClient;
  hippoSwap?: HippoSwapClient;
  tokenStores?: Record<string, aptos_framework.coin$_.CoinStore>;
  tokenInfos?: Record<string, coin_registry$_.TokenInfo>;
  requestFaucet: (symbol: string, uiAmount: string) => {};
  requestSwap: (
    fromSymbol: string,
    toSymbol: string,
    uiAmtIn: number,
    uiAmtOutMin: number,
    maxGas: number,
    expirationSecs: number
  ) => Promise<void>;
  requestDeposit: (
    lhsSymbol: string,
    rhsSymbol: string,
    poolType: PoolType,
    lhsUiAmt: number,
    rhsUiAmt: number
  ) => {};
  requestWithdraw: (
    lhsSymbol: string,
    rhsSymbol: string,
    poolType: PoolType,
    liqiudityAmt: UITokenAmount,
    lhsMinAmt: UITokenAmount,
    rhsMinAmt: UITokenAmount
  ) => {};
  transaction?: TTransaction;
  setTransaction: (trans: TTransaction) => void;
  isLoading: boolean;
}

interface TProviderProps {
  children: ReactNode;
}

const HippoClientContext = createContext<HippoClientContextType>({} as HippoClientContextType);

const HippoClientProvider: FC<TProviderProps> = ({ children }) => {
  const { activeWallet } = useAptosWallet();
  const [hippoWallet, setHippoWallet] = useState<HippoWalletClient>();
  const [hippoSwap, setHippoSwapClient] = useState<HippoSwapClient>();
  const [refresh, setRefresh] = useState(false);
  const [transaction, setTransaction] = useState<TTransaction>();
  const [tokenStores, setTokenStores] =
    useState<Record<string, aptos_framework.coin$_.CoinStore>>();
  const [tokenInfos, setTokenInfos] = useState<Record<string, coin_registry$_.TokenInfo>>();
  const [isLoading, setIsLoading] = useState(false);

  const getHippoWalletClient = useCallback(async () => {
    if (activeWallet) {
      try {
        const client = await hippoWalletClient(activeWallet.aptosAccount);
        setHippoWallet(client);
      } catch (err: any) {
        message.error(
          `Resource not found for account: ${walletAddressEllipsis(activeWallet.address || '')}`
        );
        setIsLoading(false);
      }
    }
  }, [activeWallet]);

  const getHippoSwapClient = useCallback(async () => {
    const sClient = await hippoSwapClient();
    setHippoSwapClient(sClient);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getHippoWalletClient();
    getHippoSwapClient();
  }, [activeWallet, getHippoWalletClient]);

  useEffect(() => {
    if (hippoWallet) {
      setTokenStores(hippoWallet?.symbolToCoinStore);
      setTokenInfos(hippoWallet?.symbolToTokenInfo);
      if (refresh) {
        setRefresh(false);
      }
      setIsLoading(false);
    }
  }, [hippoWallet, refresh]);

  const requestFaucet = useCallback(
    async (symbol: string) => {
      if (!activeWallet || !activeWallet.aptosAccount) throw new Error('Please login first');
      if (symbol === 'APTOS') {
        let result = await faucetClient.fundAccount(activeWallet.aptosAccount.address(), 100000);
        await hippoWallet?.refreshStores();
        setRefresh(true);
        console.log(result);
      } else {
        const uiAmtUsed = symbol === 'BTC' ? 0.01 : 10;
        const payload = await hippoWallet?.makeFaucetMintToPayload(uiAmtUsed, symbol);
        if (payload) {
          await sendPayloadTx(aptosClient, activeWallet.aptosAccount, payload);
          await hippoWallet?.refreshStores();
          setRefresh(true);
        }
      }
    },
    [activeWallet, hippoWallet]
  );

  const requestTransaction = useCallback(
    async (action: TTransaction) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount) throw new Error('Please login first');
        await sendPayloadTx(aptosClient, activeWallet.aptosAccount, action.payload);
        await hippoWallet?.refreshStores();
        setRefresh(true);
        message.success(`${action.type} successfully`);
        setTransaction({} as TTransaction);
      } catch (error) {
        throw error;
      }
    },
    [activeWallet, hippoWallet]
  );

  // const getRequestInfo = useCallback((request: UserTransactionRequest) => {

  // })

  const requestSwap = useCallback(
    async (
      fromSymbol: string,
      toSymbol: string,
      uiAmtIn: number,
      uiAmtOutMin: number,
      maxGas: number,
      expirationSecs: number
    ) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount || !hippoSwap)
          throw new Error('Please login first');
        if (uiAmtIn <= 0) {
          throw new Error('Input amount needs to be greater than 0');
        }
        const best = await hippoSwap.getBestQuoteBySymbols(fromSymbol, toSymbol, uiAmtIn, 3);
        if (!best) {
          throw new Error('Route not found');
        }
        const payload = await best.bestRoute.makeSwapPayload(uiAmtIn, uiAmtOutMin);
        const transactionInfo = { [fromSymbol]: uiAmtIn, [toSymbol]: uiAmtOutMin };
        if (payload) {
          setTransaction({ type: 'swap', payload, transactionInfo });
          await sendPayloadTx(
            aptosClient,
            activeWallet.aptosAccount,
            payload,
            maxGas,
            expirationSecs
          );
          await hippoWallet?.refreshStores();
          setRefresh(true);
          message.success('Swap successfully');
        }
      } catch (error) {
        console.log('request swap error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, requestTransaction]
  );

  const requestDeposit = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      poolType: PoolType,
      lhsUiAmt: number,
      rhsUiAmt: number
    ) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount || !hippoSwap) {
          throw new Error('Please login first');
        }
        const pools = hippoSwap.getDirectPoolsBySymbolsAndPoolType(lhsSymbol, rhsSymbol, poolType);
        if (pools.length === 0) {
          throw new Error('Such pool does not exist');
        }
        const payload = await pools[0].makeAddLiquidityPayload(lhsUiAmt, rhsUiAmt);
        const transactionInfo = { [lhsSymbol]: lhsUiAmt, [rhsSymbol]: rhsUiAmt };
        if (payload) {
          setTransaction({
            type: 'deposit',
            payload,
            transactionInfo
            // callback: requestTransaction
          });
        }
      } catch (error) {
        console.log('request deposit error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, requestTransaction]
  );

  const requestWithdraw = useCallback(
    async (
      lhsSymbol: string,
      rhsSymbol: string,
      poolType: PoolType,
      liqiudityAmt: UITokenAmount,
      lhsMinAmt: UITokenAmount,
      rhsMinAmt: UITokenAmount
    ) => {
      try {
        if (!activeWallet || !activeWallet.aptosAccount || !hippoSwap) {
          throw new Error('Please login first');
        }
        const pools = hippoSwap.getDirectPoolsBySymbolsAndPoolType(lhsSymbol, rhsSymbol, poolType);
        if (pools.length === 0) {
          throw new Error('Such pool does not exist');
        }
        const payload = await pools[0].makeRemoveLiquidityPayload(
          liqiudityAmt,
          lhsMinAmt,
          rhsMinAmt
        );
        const transactionInfo = {
          [lhsSymbol]: lhsMinAmt,
          [rhsSymbol]: rhsMinAmt,
          'liquidity amount': liqiudityAmt
        };
        if (payload) {
          setTransaction({
            type: 'withdraw',
            payload,
            transactionInfo
            // callback: requestTransaction
          });
        }
      } catch (error) {
        console.log('request withdraw error:', error);
        if (error instanceof Error) {
          message.error(error?.message);
        }
      }
    },
    [hippoSwap, activeWallet, requestTransaction]
  );

  return (
    <HippoClientContext.Provider
      value={{
        hippoWallet,
        hippoSwap,
        tokenStores,
        tokenInfos,
        requestFaucet,
        requestSwap,
        requestDeposit,
        isLoading,
        requestWithdraw,
        transaction,
        setTransaction
      }}>
      {children}
    </HippoClientContext.Provider>
  );
};

export { HippoClientProvider, HippoClientContext };
