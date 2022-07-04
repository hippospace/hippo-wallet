import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/coin_registry/coin_registry';
import classNames from 'classnames';
import CoinIcon from 'components/CoinIcon';
import { FC } from 'react';

export interface TokenLabelProps {
  className?: string;
  token?: TokenInfo;
  symbolOnly?: boolean;
}

const TokenLabel: FC<TokenLabelProps> = ({ token, symbolOnly = true, className = '' }) => {
  return (
    <div className={classNames('flex items-center', className)}>
      {token ? (
        <>
          <CoinIcon logoSrc={token.logo_url.str()} />
          <div className="ml-2">
            <div className="smallText bold">{token.symbol.str()}</div>
            {!symbolOnly && <div>{token.name.str()}</div>}
          </div>
        </>
      ) : (
        <span className="text-[12px] font-bold text-grey-700">Select Currency</span>
      )}
    </div>
  );
};

export default TokenLabel;
