import { message } from 'antd';
import ActionSheet from 'components/ActionSheet';
import Button from 'components/Button';
import PositiveFloatNumInput from 'components/PositiveFloatNumInput';
import useHippoClient from 'hooks/useHippoClient';
import useTokenBalane from 'hooks/useTokenBalance';
import { FC, useCallback, useEffect, useState } from 'react';
import { SettingGear, Switch } from 'resources/icons';
import InputWithTokenSelector from './InputWithTokenSelector';
import OrderReview from './OrderReview';
import useSwapStore from './store';
import SwapDetail from './SwapDetail';
import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8/TokenRegistry';

const Swap: FC = () => {
  const { tokenInfos, hippoSwap, requestSwap } = useHippoClient();

  const input = useSwapStore((state) => state.input);
  const output = useSwapStore((state) => state.output);
  const setStoreInput = useSwapStore((state) => state.setInput);
  const setStoreOutputToken = useSwapStore((state) => state.setOutputToken);
  const swapSettings = useSwapStore((state) => state.settings);
  const setSlippage = useSwapStore((state) => state.setSlippage);
  const setTxDeadline = useSwapStore((state) => state.setTxDeadline);

  const [inputToken, setInputToken] = useState(input.token);
  const [outputToken, setOutputToken] = useState(output.token);

  useEffect(() => {
    if (tokenInfos) {
      if (!inputToken) {
        setInputToken(tokenInfos.BTC);
      }
      if (!outputToken) {
        setOutputToken(tokenInfos.USDC);
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
    const fromSymbol = input.token?.symbol;
    const toSymbol = output.token?.symbol;
    const fromUiAmt = input.amount;
    if (hippoSwap && fromSymbol && toSymbol && fromUiAmt) {
      const quote = hippoSwap.getBestQuoteBySymbols(fromSymbol, toSymbol, fromUiAmt, 3);
      if (quote) {
        const minOut = quote.bestQuote.outputUiAmt * (1 - swapSettings.slippageTolerance / 100);
        await requestSwap(fromSymbol, toSymbol, fromUiAmt, minOut);
        setInputAmount(0);
        setIsReviewOrderVisible(false);
        // TODO: in process window
        // TODO: success and fail window
      } else {
        message.error('Swap route not available');
      }
    }
  }, [
    hippoSwap,
    input.amount,
    input.token?.symbol,
    output.token?.symbol,
    requestSwap,
    swapSettings.slippageTolerance
  ]);

  const [isTxSettingsVisible, setIsTxSettingsVisible] = useState(false);
  const slippageOptions = [0.5, 1, 2];

  const [isReviewOrderVisible, setIsReviewOrderVisible] = useState(false);

  const [inputTokenBalance] = useTokenBalane(inputToken?.symbol);

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
        <div className="flex justify-between text-gray-50 mb-1 px-1">
          <span>You Pay</span>
          <span>
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
      <Button className="ml-auto mr-2 mt-2 -mb-4" variant="icon" onClick={switchToken}>
        <Switch className="fill-white" />
      </Button>
      <div>
        <div className="text-gray-50 mb-1 px-1">
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
        className="ml-auto mr-2 mb-1 mt-4"
        onClick={() => setIsTxSettingsVisible(true)}>
        <SettingGear className="font-icon text-white text-base" />
      </Button>
      <SwapDetail />
      <Button
        variant={'solid'}
        className="w-full mb-2 mt-auto"
        disabled={isSwapDisabled}
        onClick={() => setIsReviewOrderVisible(true)}>
        Swap
      </Button>

      <ActionSheet
        visible={isTxSettingsVisible}
        title={'Transaction Settings'}
        onClose={() => setIsTxSettingsVisible(false)}
        mode="auto">
        <div>
          <div className="font-bold mb-2 text-base">Slippage tolerance</div>
          <div className="flex gap-2">
            {slippageOptions.map((s, i) => {
              return (
                <Button
                  key={`st-${i}`}
                  className="flex-1 h-10"
                  variant={swapSettings.slippageTolerance === s ? 'selected' : 'notSelected'}
                  onClick={() => setSlippage(s)}>
                  {s}%
                </Button>
              );
            })}
            <div className="flex items-center relative">
              <PositiveFloatNumInput
                inputAmount={
                  slippageOptions.includes(swapSettings.slippageTolerance)
                    ? 0
                    : swapSettings.slippageTolerance
                }
                placeholder="custom"
                className="border-[3px] border-grey-900 rounded-xl text-right w-20 h-10 mr-1"
                onAmountChange={(v) => setSlippage(v)}
              />
              %
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-bold mb-2 text-base">Transaction deadline</div>
          <PositiveFloatNumInput
            inputAmount={swapSettings.txDeadline}
            className="border-[3px] border-grey-900 rounded-xl text-right w-20 h-10 mr-2"
            onAmountChange={(v) => setTxDeadline(v)}
          />
          minutes
        </div>
      </ActionSheet>
      <ActionSheet
        visible={isReviewOrderVisible}
        mode={'fullTab'}
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
    </div>
  );
};

export default Swap;
