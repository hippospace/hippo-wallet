import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8';
import TokenLabel from 'components/TokenLabel';
import { FC } from 'react';
import { CaretIcon } from 'resources/icons';

export interface TokenSelectorProps {
  currentToken: TokenRegistry.TokenInfo;
  onSelect: () => {} | void;
}

const TokenSelector: FC<TokenSelectorProps> = ({ currentToken, onSelect = () => {} }) => {
  return (
    <div className="flex items-center cursor-pointer" onClick={onSelect}>
      <TokenLabel token={currentToken} />
      <CaretIcon className="fill-black ml-1" />
    </div>
  );
};

export default TokenSelector;
