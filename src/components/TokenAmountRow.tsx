import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8/TokenRegistry';
import classNames from 'classnames';
import TokenLabel from 'components/TokenLabel';
import useTokenBalane from 'hooks/useTokenBalance';
import { FC } from 'react';

export interface TokenListRowProps {
  token: TokenInfo;
  className?: string;
  onClick?: () => void;
}

const TokenListRow: FC<TokenListRowProps> = ({ token, className = '', onClick }) => {
  const [balance] = useTokenBalane(token.symbol);
  return (
    <div
      className={classNames(
        'group flex justify-between items-center p-2 border-grey-900 cursor-pointer rounded border-2',
        className
      )}
      onClick={onClick}>
      <TokenLabel token={token} symbolOnly={false} />
      <div>
        {balance} {token.symbol}
      </div>
    </div>
  );
};

export default TokenListRow;
