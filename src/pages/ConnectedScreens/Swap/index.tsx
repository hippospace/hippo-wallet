import { message, Spin } from 'antd';
import ActionSheet from 'components/ActionSheet';
import Button from 'components/Button';
import useHippoClient from 'hooks/useHippoClient';
import useTokenBalane from 'hooks/useTokenBalance';
import { FC, useCallback, useEffect, useState } from 'react';
import { SettingGear, Switch } from 'resources/icons';
import InputWithTokenSelector from './InputWithTokenSelector';
import OrderReview from './OrderReview';
import useSwapStore from './store';
import SwapDetail from './SwapDetail';
import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/coin_registry/coin_registry';
import Settings from './Settings';

type SwapStatus = 'ready' | 'swapping' | 'success' | 'failed' | 'expired';

const Swap: FC = () => {
  const { tokenInfos, hippoSwap, requestSwap } = useHippoClient();

  const input = useSwapStore((state) => state.input);
  const output = useSwapStore((state) => state.output);
  const setStoreInput = useSwapStore((state) => state.setInput);
  const setStoreOutputToken = useSwapStore((state) => state.setOutputToken);
  const swapSettings = useSwapStore((state) => state.settings);
  const [inputToken, setInputToken] = useState(input.token);
  const [outputToken, setOutputToken] = useState(output.token);
  const expireMinutes = useSwapStore((state) => state.settings.txDeadline);
  const maxGasFee = useSwapStore((state) => state.settings.maxGasFee);

  const [swapStatus, setSwapStatus] = useState<SwapStatus>('ready');

  useEffect(() => {
    if (tokenInfos) {
      if (!inputToken) {
        setInputToken(tokenInfos.USDC);
      }
      if (!outputToken) {
        setOutputToken(tokenInfos.APTOS);
      }
    }
  }, [inputToken, outputToken, tokenInfos]);

  const [inputAmount, setInputAmount] = useState(input.amount);
  const outputAmount = output.amount;

  useEffect(() => {
    setStoreInput({
      token: inputToken,
      amount: inputAmount
    });
  }, [inputToken, inputAmount, setStoreInput]);

  useEffect(() => {
    if (outputToken) setStoreOutputToken(outputToken);
  }, [outputToken, setStoreOutputToken]);

  const switchToken = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
  }, [inputToken, outputAmount, outputToken]);

  const onSwap = useCallback(async () => {
    try {
      setSwapStatus('swapping');
      const fromSymbol = input.token?.symbol;
      const toSymbol = output.token?.symbol;
      const fromUiAmt = input.amount;
      if (hippoSwap && fromSymbol && toSymbol && fromUiAmt) {
        const quote = hippoSwap.getBestQuoteBySymbols(
          fromSymbol.str(),
          toSymbol.str(),
          fromUiAmt,
          3
        );
        if (quote) {
          const minOut = quote.bestQuote.outputUiAmt * (1 - swapSettings.slippageTolerance / 100);
          await requestSwap(
            fromSymbol.str(),
            toSymbol.str(),
            fromUiAmt,
            minOut,
            maxGasFee,
            expireMinutes * 60
          );
          setInputAmount(0);
          setIsReviewOrderVisible(false);
          setSwapStatus('success');
        } else {
          message.error('Swap route not available');
        }
      }
    } catch (err) {
      setSwapStatus('failed');
    }
  }, [
    expireMinutes,
    hippoSwap,
    input.amount,
    input.token?.symbol,
    maxGasFee,
    output.token?.symbol,
    requestSwap,
    swapSettings.slippageTolerance
  ]);

  const [isTxSettingsVisible, setIsTxSettingsVisible] = useState(false);
  const [isReviewOrderVisible, setIsReviewOrderVisible] = useState(false);

  const [inputTokenBalance] = useTokenBalane(inputToken?.symbol.str());
  const isSwapDisabled = !inputAmount || inputAmount > inputTokenBalance;

  const onInputTokenSelected = useCallback(
    (t: TokenInfo) => {
      if (t.symbol === outputToken?.symbol) {
        switchToken();
      } else {
        setInputToken(t);
      }
    },
    [outputToken?.symbol, switchToken]
  );

  const onOutputTokenSelected = useCallback(
    (t: TokenInfo) => {
      if (t.symbol === inputToken?.symbol) {
        switchToken();
      } else {
        setOutputToken(t);
      }
    },
    [inputToken?.symbol, switchToken]
  );

  return (
    <div className="pt-4 h-full flex flex-col min-h-full">
      <div>
        <div className="flex justify-between text-gray-50 mb-1">
          <span className="title">You Pay</span>
          <span className="largeText bold text-gray-300">
            Max:{' '}
            <span
              className="active:text-blue-500 underline"
              onClick={() => setInputAmount(inputTokenBalance)}>
              {inputTokenBalance}
            </span>
          </span>
        </div>
        <InputWithTokenSelector
          token={inputToken}
          inputAmount={inputAmount}
          onAmountChange={(a: number) => setInputAmount(a)}
          excludeTokens={inputToken ? [inputToken] : []}
          onTokenSelected={onInputTokenSelected}
        />
      </div>
      <Button className="mx-auto mt-4 mb-2" variant="icon" onClick={switchToken}>
        <Switch className="font-icon text-white text-2xl" />
      </Button>
      <div>
        <div className="text-gray-50 mb-1 title">
          <span>You Recieve</span>
        </div>
        <InputWithTokenSelector
          token={outputToken}
          isInputDisabled={true}
          inputAmount={outputAmount}
          excludeTokens={outputToken ? [outputToken] : []}
          onTokenSelected={onOutputTokenSelected}
        />
      </div>
      <Button
        variant="icon"
        className="ml-auto mr-0 mb-2 mt-4"
        onClick={() => setIsTxSettingsVisible(true)}>
        <SettingGear className="font-icon text-white text-base" />
      </Button>
      <SwapDetail />
      <Button
        variant={'solid'}
        className="w-full mb-2 mt-auto !border-none"
        disabled={isSwapDisabled}
        onClick={() => setIsReviewOrderVisible(true)}>
        Swap
      </Button>

      <ActionSheet
        visible={isTxSettingsVisible}
        title={'Transaction Settings'}
        onClose={() => setIsTxSettingsVisible(false)}
        mode="auto">
        <Settings />
      </ActionSheet>
      <ActionSheet
        visible={isReviewOrderVisible}
        mode={'fullTab'}
        destroyOnClose={true}
        footer={
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outlined"
              onClick={() => setIsReviewOrderVisible(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onSwap()}>
              Confirm
            </Button>
          </div>
        }>
        <OrderReview />
      </ActionSheet>
      <ActionSheet
        visible={(['success', 'failed', 'swapping', 'expired'] as SwapStatus[]).includes(
          swapStatus
        )}
        mode={'fullScreen'}
        onClose={() => setSwapStatus('ready')}>
        <div className="w-full h-full flex flex-col justify-center items-center">
          <div className="text-[56px] text-center">
            {swapStatus === 'success' ? (
              '🎉'
            ) : swapStatus === 'swapping' ? (
              <Spin size="large" />
            ) : (
              '🚫'
            )}
          </div>
          <div className="text-center text-grey-100 h5">
            {swapStatus === 'success'
              ? 'Swap completed!'
              : swapStatus === 'expired'
              ? 'Swap expired!'
              : swapStatus === 'swapping'
              ? 'Swapping tokens...'
              : 'Swap failed!'}
          </div>
          {/* TODO: add tx link or details */}
        </div>
      </ActionSheet>
    </div>
  );
};

export default Swap;
