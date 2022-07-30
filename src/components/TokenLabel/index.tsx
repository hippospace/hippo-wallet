import { coin_registry } from '@manahippo/hippo-sdk';
import classNames from 'classnames';
import CoinIcon from 'components/CoinIcon';
import { FC } from 'react';

export interface TokenLabelProps {
  className?: string;
  token?: coin_registry.coin_registry$_.TokenInfo;
  symbolOnly?: boolean;
}

const TokenLabel: FC<TokenLabelProps> = ({ token, symbolOnly = true, className = '' }) => {
  return (
    <div className={classNames('flex items-center', className)}>
      {token ? (
        <>
          <CoinIcon logoSrc={token.logo_url.str()} />
          <div className="ml-1">
            <div className="font-extrabold">{token.symbol.str()}</div>
            {!symbolOnly && <div>{token.name.str()}</div>}
          </div>
        </>
      ) : (
        'Select Currency'
      )}
    </div>
  );
};

export default TokenLabel;
