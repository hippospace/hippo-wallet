import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8';
import ActionSheet from 'components/ActionSheet';
import Button from 'components/Button';
import PositiveFloatNumInput from 'components/PositiveFloatNumInput';
import useHippoClient from 'hooks/useHippoClient';
import { FC, useCallback, useEffect, useState } from 'react';
import { SettingGear, Switch } from 'resources/icons';
import InputWithTokenSelector from './InputWithTokenSelector';
import OrderReview from './OrderReview';
import useSwapStore from './store';
import SwapDetail from './SwapDetail';
import TokenListRow from './TokenListRow';

const Swap: FC = () => {
  const { tokenInfos } = useHippoClient();
  if (!tokenInfos) throw new Error('No token infos get for swap');

  const { hippoSwap, requestSwap } = useHippoClient();

  const tokenBTC = tokenInfos!.BTC;
  const tokenUSDC = tokenInfos!.USDC;

  const input = useSwapStore((state) => state.input);
  const output = useSwapStore((state) => state.output);
  const setStoreInput = useSwapStore((state) => state.setInput);
  const setStoreOutputToken = useSwapStore((state) => state.setOutputToken);
  const swapSettings = useSwapStore((state) => state.settings);
  const resetAmounts = useSwapStore((state) => state.resetAmounts);
  const setSlippage = useSwapStore((state) => state.setSlippage);
  const setTxDeadline = useSwapStore((state) => state.setTxDeadline);

  const [inputToken, setInputToken] = useState(input.token ?? tokenUSDC);
  const [outputToken, setOutputToken] = useState(output.token ?? tokenBTC);

  const [inputAmount, setInputAmount] = useState(input.amount);
  const outputAmount = output.amount;

  useEffect(() => {
    setStoreInput({
      token: inputToken,
      amount: inputAmount
    });
  }, [inputToken, inputAmount, setStoreInput]);

  useEffect(() => {
    setStoreOutputToken(outputToken);
  }, [outputToken, setStoreOutputToken]);

  const [tokenListVisible, setTokenListVisible] = useState(0);

  const switchToken = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
  }, [inputToken, outputAmount, outputToken]);

  const onTokenListRowClick = useCallback(
    (ti: TokenRegistry.TokenInfo) => {
      if (tokenListVisible === 1) {
        if (ti.symbol === outputToken.symbol) {
          switchToken();
        } else {
          setInputToken(ti);
        }
      } else {
        if (ti.symbol === inputToken.symbol) {
          switchToken();
        } else {
          setOutputToken(ti);
        }
      }
      setTokenListVisible(0);
    },
    [inputToken.symbol, outputToken.symbol, switchToken, tokenListVisible]
  );

  const onSwap = useCallback(async () => {
    const fromSymbol = input.token?.symbol;
    const toSymbol = output.token?.symbol;
    const fromUiAmt = input.amount;
    if (hippoSwap && fromSymbol && toSymbol && fromUiAmt) {
      const quote = hippoSwap.getBestQuoteBySymbols(fromSymbol, toSymbol, fromUiAmt, 3);
      if (quote) {
        const minOut = quote.bestQuote.outputUiAmt * (1 - swapSettings.slippageTolerance / 100);
        await requestSwap(fromSymbol, toSymbol, fromUiAmt, minOut);
        resetAmounts();
        // TODO: confirm window
        // TODO: in process window
        // TODO: success and fail window
      } else {
        // TODO: info bubble "route note available"
      }
    }
  }, [
    hippoSwap,
    input.amount,
    input.token?.symbol,
    output.token?.symbol,
    requestSwap,
    resetAmounts,
    swapSettings.slippageTolerance
  ]);

  const [isTxSettingsVisible, setIsTxSettingsVisible] = useState(false);
  const slippageOptions = [0.5, 1, 2];

  const [isReviewOrderVisible, setIsReviewOrderVisible] = useState(false);

  const isSwapDisabled = !inputAmount;

  return (
    <div className="pt-4 h-full flex flex-col min-h-full">
      <div>
        <div className="flex justify-between text-gray-50 mb-1 px-1 font-bold">
          <span>You Pay</span>
          <span>Max: 1000</span>
        </div>
        <InputWithTokenSelector
          token={inputToken}
          onSelectToken={() => setTokenListVisible(1)}
          inputAmount={inputAmount}
          onAmountChange={(a: number) => setInputAmount(a)}
        />
      </div>
      <Button className="mx-auto button-pt" variant="space" onClick={switchToken}>
        <Switch />
      </Button>
      <div>
        <div className="text-gray-50 mb-1 px-1 font-bold">
          <span>You Recieve</span>
        </div>
        <InputWithTokenSelector
          token={outputToken}
          onSelectToken={() => setTokenListVisible(2)}
          isInputDisabled={true}
          inputAmount={outputAmount}
        />
      </div>
      <Button
        variant="icon"
        className="ml-auto mr-2 mb-1 mt-10"
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
        visible={!!tokenListVisible}
        mode={'fullTab'}
        onClose={() => setTokenListVisible(0)}>
        {Object.values(tokenInfos)
          .filter(
            (ti) =>
              ti.symbol !== (tokenListVisible === 1 ? inputToken.symbol : outputToken.symbol) &&
              (ti.token_type.module_name.toString().startsWith('MockCoin') || ti.symbol === 'APTOS')
          )
          .map((ti) => {
            return (
              <TokenListRow
                className="mb-2 rounded-md last:mb-0"
                key={ti.symbol}
                token={ti}
                onClick={() => onTokenListRowClick(ti)}
              />
            );
          })}
      </ActionSheet>
      <ActionSheet
        visible={isTxSettingsVisible}
        variant={'darkBg'}
        title={'Transaction Settings'}
        onClose={() => setIsTxSettingsVisible(false)}
        mode="auto">
        <div>
          <div className="font-bold mb-2 text-base text-grey-100">Slippage Tolerance</div>
          <div className="flex gap-2 w-full">
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
          </div>
          <div className="flex items-center relative pt-2">
            <div className="inline-flex border-[3px] border-grey-300 rounded-xl text-right w-full h-10 px-2">
              <PositiveFloatNumInput
                inputAmount={
                  slippageOptions.includes(swapSettings.slippageTolerance)
                    ? 0
                    : swapSettings.slippageTolerance
                }
                placeholder="Custom"
                className="h-full w-full bg-transparent font-bold text-grey-300"
                onAmountChange={(v) => setSlippage(v)}
              />
              <div className="font-bold h-full w-full">
                <span className="h-full flex justify-end items-center text-grey-300">%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 mb-2">
          <div className="font-bold mb-2 text-base text-grey-100">Transaction Deadline</div>
          <div className="flex items-center">
            <div className="inline-flex justify-center items-center border-[3px] border-grey-300 rounded-xl text-right w-full h-10 px-2">
              <PositiveFloatNumInput
                inputAmount={swapSettings.txDeadline}
                className="h-full w-full bg-transparent font-bold text-grey-300"
                onAmountChange={(v) => setTxDeadline(v)}
              />
              <div className="font-bold h-full">
                <span className="h-full flex justify-center items-center text-grey-300">
                  Minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </ActionSheet>
      <ActionSheet
        visible={isReviewOrderVisible}
        mode={'fullTab'}
        variant={'darkBg'}
        footer={
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="outlined"
              onClick={() => setIsReviewOrderVisible(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => onSwap()}>
              Swap
            </Button>
          </div>
        }>
        <div className="font-bold text-2xl text-grey-100 text-center mb-4">Review Order</div>
        <OrderReview />
      </ActionSheet>
    </div>
  );
};

export default Swap;
