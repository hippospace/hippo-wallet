import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8';
import PositiveFloatNumInput from 'components/PositiveFloatNumInput';
import TokenSelector from 'components/TokenSelector';
import { FC } from 'react';

export interface InputWithTokenSelectorProps {
  token: TokenRegistry.TokenInfo;
  inputAmount?: number;
  isInputDisabled?: boolean;
  onSelectToken: () => void;
  onAmountChange?: (a: number) => void;
}

const InputWithTokenSelector: FC<InputWithTokenSelectorProps> = ({
  token,
  inputAmount,
  onSelectToken = () => {},
  isInputDisabled = false,
  onAmountChange
}) => {
  return (
    <div className="flex items-center justify-between bg-grey-100 py-1 px-2 rounded-xl ">
      <TokenSelector currentToken={token} onSelect={onSelectToken} />
      <PositiveFloatNumInput
        inputAmount={inputAmount}
        className="bg-grey-100 text-base font-extrabold h-11 border-none text-right pr-0"
        isDisabled={isInputDisabled}
        onAmountChange={onAmountChange}
      />
    </div>
  );
};

export default InputWithTokenSelector;
