import useHippoClient from 'hooks/useHippoClient';
import { useEffect, useState } from 'react';
import useSwapStore from './store';

const SwapDetail: React.FC = () => {
  const hippoClient = useHippoClient();
  const inputStore = useSwapStore((state) => state.input);
  const outputStore = useSwapStore((state) => state.output);
  const slipTolerance = useSwapStore((state) => state.settings.slippageTolerance);
  const setOutputAmount = useSwapStore((state) => state.setOutputAmount);

  const [expectedOutput, setExpectedOutput] = useState('...');
  const [minimumReceived, setMinimumReceived] = useState('...');
  const [priceImpact, setPriceImpact] = useState('...');

  useEffect(() => {
    if (hippoClient.hippoSwap && inputStore.amount && inputStore.token && outputStore.token) {
      const fromSymbol = inputStore.token.symbol;
      const toSymbol = outputStore.token.symbol;

      const quote = hippoClient.hippoSwap.getBestQuoteBySymbols(
        fromSymbol,
        toSymbol,
        inputStore.amount,
        3
      );
      if (quote) {
        const outputUiAmt = quote.bestQuote.outputUiAmt;
        setExpectedOutput(`${outputUiAmt.toFixed(6)} ${toSymbol}`);
        setMinimumReceived(`${(outputUiAmt * (1 - slipTolerance / 100)).toFixed(4)} ${toSymbol}`);
        setPriceImpact(`${(quote.bestQuote.priceImpact * 100).toFixed(2)}%`);
        setOutputAmount(parseFloat(outputUiAmt.toFixed(6)));
      } else {
        setExpectedOutput('route unavailable');
        setMinimumReceived('route unavailable');
        setPriceImpact('route unavailable');
        setOutputAmount(0);
      }
    } else {
      setOutputAmount(0);
      setExpectedOutput('...');
      setMinimumReceived('...');
      setPriceImpact('...');
    }
  }, [
    hippoClient.hippoSwap,
    inputStore.amount,
    inputStore.token,
    outputStore.token,
    setOutputAmount,
    slipTolerance
  ]);

  const details = [
    {
      label: 'Expected Output',
      value: expectedOutput
    },
    {
      label: 'Minimum received',
      value: minimumReceived
    },
    {
      label: 'Price Impact',
      value: priceImpact
    },
    {
      label: 'Slippage tolerance',
      value: `${slipTolerance} %`
    }
  ];

  return (
    <div className="flex flex-col gap-2 py-4 px-4 bg-grey-100">
      {details.map((detail) => (
        <div className="flex justify-between" key={detail.label}>
          <small className="text-sm font-bold text-grey-700">{detail.label}</small>
          <small className="text-sm font-bold text-grey-700">{detail.value}</small>
        </div>
      ))}
    </div>
  );
};

export default SwapDetail;
