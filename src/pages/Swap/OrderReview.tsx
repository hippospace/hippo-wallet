import { FC } from 'react';
import useSwapStore from './store';
import SwapDetail from './SwapDetail';

const OrderReview: FC = () => {
  const inputStore = useSwapStore((state) => state.input);
  const output = useSwapStore((state) => state.output);

  return (
    <div>
      <div className="font-bold text-xl mb-2">Swap confirmation</div>
      <div className="bg-grey-300 rounded-lg mb-2 px-2 py-4">
        <div className="text-base font-bold mb-1 text-gray-500">You pay</div>
        <div className="text-2xl font-bold">
          {inputStore.amount} {inputStore.token?.symbol}
        </div>
      </div>
      <div className="bg-grey-300 rounded-lg px-2 py-4 mb-4">
        <div className="text-base font-bold mb-1 text-gray-500">You receive</div>
        <div className="text-2xl font-bold">
          {output.amount} {output.token?.symbol}
        </div>
      </div>
      <SwapDetail />
    </div>
  );
};

export default OrderReview;
