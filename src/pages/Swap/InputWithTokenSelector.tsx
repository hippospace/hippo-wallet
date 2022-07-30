import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/coin_registry/coin_registry';
import PositiveFloatNumInput from 'components/PositiveFloatNumInput';
import TokenSelector from 'components/TokenSelector';
import { FC } from 'react';

export interface InputWithTokenSelectorProps {
  token?: TokenInfo;
  inputAmount?: number;
  isInputDisabled?: boolean;
  onAmountChange?: (a: number) => void;
  excludeTokens?: TokenInfo[];
  onTokenSelected: (ti: TokenInfo) => void;
}

const InputWithTokenSelector: FC<InputWithTokenSelectorProps> = ({
  token,
  inputAmount,
  isInputDisabled = false,
  onAmountChange,
  onTokenSelected,
  excludeTokens = []
}) => {
  return (
    <div className="flex items-center justify-between bg-grey-100 py-1 px-2 rounded-xl border-[3px] border-grey-900">
      <TokenSelector
        currentToken={token}
        onTokenSelected={onTokenSelected}
        excludeTokens={excludeTokens}
      />
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
