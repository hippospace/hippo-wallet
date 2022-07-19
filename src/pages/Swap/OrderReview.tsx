import { FC } from 'react';
import useSwapStore from './store';
import SwapDetail from './SwapDetail';

const OrderReview: FC = () => {
  const inputStore = useSwapStore((state) => state.input);
  const output = useSwapStore((state) => state.output);

  return (
    <div>
      <div className="bg-secondary mb-10 px-4 py-4">
        <div className="mb-4">
          <div className="text-base font-bold mb-2 text-gray-500">You Pay</div>
          <div className="text-xl font-bold">
            {inputStore.amount} {inputStore.token?.symbol}
          </div>
        </div>
        <hr className="border-1" />
        <div className="mt-4">
          <div className="text-base font-bold mb-2 text-gray-500">You Receive</div>
          <div className="text-xl font-bold">
            {output.amount} {output.token?.symbol}
          </div>
        </div>
      </div>
      <SwapDetail />
    </div>
  );
};

export default OrderReview;
