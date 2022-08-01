import { Spin } from 'antd';
import classNames from 'classnames';
import { aptosClient } from 'config/aptosClient';
import useAptosWallet from 'hooks/useAptosWallet';
import useHippoClient from 'hooks/useHippoClient';
import { useEffect, useState } from 'react';
import useSwapStore from './store';

interface ITxSimulationResult {
  success: boolean;
  gasUsed: number;
}

interface ISwapDetailProps {
  wouldShowSimulationResult?: boolean;
}

const SwapDetail: React.FC<ISwapDetailProps> = ({ wouldShowSimulationResult = false }) => {
  const hippoClient = useHippoClient();
  const { activeWallet } = useAptosWallet();
  const inputStore = useSwapStore((state) => state.input);
  const outputStore = useSwapStore((state) => state.output);
  const slipTolerance = useSwapStore((state) => state.settings.slippageTolerance);
  const expireMinutes = useSwapStore((state) => state.settings.txDeadline);
  const maxGasFee = useSwapStore((state) => state.settings.maxGasFee);
  const setOutputAmount = useSwapStore((state) => state.setOutputAmount);

  const [expectedOutput, setExpectedOutput] = useState('...');
  const [minimumReceived, setMinimumReceived] = useState('...');
  const [priceImpact, setPriceImpact] = useState('...');

  const [txSimuRes, setTxSimuRes] = useState<ITxSimulationResult>({ success: false, gasUsed: 0 });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (
        hippoClient.hippoSwap &&
        inputStore.amount &&
        inputStore.token &&
        outputStore.token &&
        activeWallet?.aptosAccount
      ) {
        setIsLoading(true);

        const fromSymbol = inputStore.token.symbol;
        const toSymbol = outputStore.token.symbol;
        const account = activeWallet?.aptosAccount;

        const quote = hippoClient.hippoSwap.getBestQuoteBySymbols(
          fromSymbol.str(),
          toSymbol.str(),
          inputStore.amount,
          3
        );
        if (quote) {
          const outputUiAmt = quote.bestQuote.outputUiAmt;
          const minReceivedNum = outputUiAmt * (1 - slipTolerance / 100);

          if (wouldShowSimulationResult) {
            const payload = await quote.bestRoute.makeSwapPayload(
              inputStore.amount,
              minReceivedNum
            );
            const txnRequest = await aptosClient.generateTransaction(account.address(), payload, {
              max_gas_amount: `${maxGasFee}`,
              expiration_timestamp_secs: `${
                Math.floor(new Date().getTime() / 1000) + expireMinutes * 60
              }`
            });
            const output = await aptosClient.simulateTransaction(account, txnRequest);

            setTxSimuRes({
              success: output.success,
              gasUsed: output.success ? parseInt(output.gas_used) : 0
            });
          }

          setExpectedOutput(`${outputUiAmt.toFixed(6)} ${toSymbol.str()}`);
          setMinimumReceived(`${minReceivedNum.toFixed(6)} ${toSymbol.str()}`);
          setPriceImpact(`${(quote.bestQuote.priceImpact * 100).toFixed(2)}%`);
          setOutputAmount(parseFloat(outputUiAmt.toFixed(6)));
        } else {
          setExpectedOutput('route unavailable');
          setMinimumReceived('route unavailable');
          setPriceImpact('route unavailable');
          setOutputAmount(0);
        }
        setIsLoading(false);
      } else {
        setOutputAmount(0);
        setExpectedOutput('...');
        setMinimumReceived('...');
        setPriceImpact('...');
      }
    })();
  }, [
    activeWallet?.aptosAccount,
    expireMinutes,
    hippoClient.hippoSwap,
    inputStore.amount,
    inputStore.token,
    wouldShowSimulationResult,
    maxGasFee,
    outputStore.token,
    setOutputAmount,
    slipTolerance
  ]);

  const details = [
    {
      label: 'Expected Output',
      value: <>{expectedOutput}</>
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

  if (wouldShowSimulationResult) {
    details.push(
      ...[
        {
          label: 'Simulated result',
          value: (
            <span className={classNames('text-green-500', { 'text-rose-500': !txSimuRes.success })}>
              {txSimuRes.success ? 'success' : 'failed'}
            </span>
          )
        },
        {
          label: 'Gas estimated',
          value: <span>{txSimuRes.gasUsed}</span>
        }
      ]
    );
  }

  return (
    <div className="relative flex flex-col gap-y-2 py-4 px-2 bg-grey-100">
      {isLoading && (
        <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center">
          <Spin size="default" />
        </div>
      )}
      {details.map((detail) => (
        <div
          className={classNames('flex justify-between', { invisible: isLoading })}
          key={detail.label}>
          <small className="font-bold text-grey-700">{detail.label}</small>
          <small className="font-bold text-grey-700">{detail.value}</small>
        </div>
      ))}
    </div>
  );
};

export default SwapDetail;
