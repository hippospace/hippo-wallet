import classNames from 'classnames';
import Button from 'components/Button';
import PositiveFloatNumInput from 'components/PositiveFloatNumInput';
import useSwapStore from './store';

const Settings = () => {
  const slippageOptions = [0.5, 1, 2];

  const swapSettings = useSwapStore((state) => state.settings);
  const setSlippage = useSwapStore((state) => state.setSlippage);
  const setTxDeadline = useSwapStore((state) => state.setTxDeadline);

  const isCustomSlippage = !slippageOptions.includes(swapSettings.slippageTolerance);

  return (
    <>
      <div>
        <div className="largeText bold mb-2 text-white">Slippage Tolerance</div>
        <div className="flex gap-2">
          {slippageOptions.map((s, i) => {
            return (
              <Button
                key={`st-${i}`}
                className="flex-1 h-9 rounded-md"
                variant={swapSettings.slippageTolerance === s ? 'selected' : 'notSelected'}
                onClick={() => setSlippage(s)}>
                {s}%
              </Button>
            );
          })}
        </div>
        <div
          className={classNames(
            'flex items-center relative border-[3px] border-grey-500 rounded-md h-9 mt-2 pl-4',
            { '!border-grey-100': isCustomSlippage }
          )}>
          <PositiveFloatNumInput
            inputAmount={
              slippageOptions.includes(swapSettings.slippageTolerance)
                ? 0
                : swapSettings.slippageTolerance
            }
            min={0}
            max={10}
            isConfine={true}
            placeholder="Custom"
            className={classNames(
              'rounded-xl w-full h-full mr-1 bg-transparent text-grey-500 largeText bold',
              { 'text-grey-100': isCustomSlippage }
            )}
            onAmountChange={(v) => setSlippage(v)}
          />
          <div
            className={classNames('mx-4 text-grey-500 largeText bold', {
              'text-grey-100': isCustomSlippage
            })}>
            %
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="largeText bold mb-2 text-white">Transaction Deadline</div>
        <div className="flex items-center border-[3px] border-grey-300 rounded-md text-right h-9 pl-4">
          <PositiveFloatNumInput
            inputAmount={swapSettings.txDeadline}
            className="bg-transparent text-grey-300 w-full largeText bold"
            min={0}
            max={10}
            isConfine={true}
            onAmountChange={(v) => setTxDeadline(v)}
          />
          <span className="text-grey-300 px-4 largeText bold">Minutes</span>
        </div>
      </div>
    </>
  );
};

export default Settings;
