import { FC } from 'react';
import useSwapStore from './store';
import SwapDetail from './SwapDetail';

const OrderReview: FC = () => {
  const inputStore = useSwapStore((state) => state.input);
  const output = useSwapStore((state) => state.output);

  return (
    <div>
      <h5 className="font-bold mb-2 text-center text-grey-100">Review Order</h5>
      <div className="bg-grey-100 p-4 mb-5">
        <div className="pb-4 border-b-2 border-grey-300">
          <div className="largeText bold mb-1 text-gray-700">You pay</div>
          <div className="h6 font-bold text-grey-900">
            {inputStore.amount} {inputStore.token?.symbol.str()}
          </div>
        </div>
        <div className="pt-4">
          <div className="largeText bold mb-1 text-gray-700">You receive</div>
          <div className="h6 font-bold text-grey-900">
            {output.amount} {output.token?.symbol.str()}
          </div>
        </div>
      </div>
      <SwapDetail wouldShowSimulationResult={true} />
    </div>
  );
};

export default OrderReview;
