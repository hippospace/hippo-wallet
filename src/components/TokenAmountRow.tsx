import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/coin_registry/coin_registry';
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
  const [balance] = useTokenBalane(token.symbol.str());
  return (
    <div
      className={classNames(
        'group flex justify-between items-center p-2 border-grey-900 cursor-pointer rounded border-2',
        className
      )}
      onClick={onClick}>
      <TokenLabel token={token} symbolOnly={false} />
      <div>
        {balance} {token.symbol.str()}
      </div>
    </div>
  );
};

export default TokenListRow;
