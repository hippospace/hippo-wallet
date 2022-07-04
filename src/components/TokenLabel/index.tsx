import { TokenRegistry } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8';
import classNames from 'classnames';
import CoinIcon from 'components/CoinIcon';
import { FC } from 'react';

export interface TokenLabelProps {
  className?: string;
  token?: TokenRegistry.TokenInfo;
  symbolOnly?: boolean;
}

const TokenLabel: FC<TokenLabelProps> = ({ token, symbolOnly = true, className = '' }) => {
  return (
    <div className={classNames('flex items-center', className)}>
      {token ? (
        <>
          <CoinIcon logoSrc={token.logo_url} />
          <div className="ml-1">
            <div className="font-extrabold">{token.symbol}</div>
            {!symbolOnly && <div>{token.name}</div>}
          </div>
        </>
      ) : (
        'Select Currency'
      )}
    </div>
  );
};

export default TokenLabel;
