import Button from 'components/Button';
import CoinIcon from 'components/CoinIcon';
import useAvailabeTokenSymbols from 'hooks/useAvailabeTokenSymbols';
import useHippoClient from 'hooks/useHippoClient';
import { useCallback, useMemo, useState } from 'react';

const Faucet: React.FC = () => {
  const [loading, setLoading] = useState('');
  const { tokenStores, tokenInfos, requestFaucet } = useHippoClient();
  const [availabeTokenSymbols] = useAvailabeTokenSymbols();

  const onRequestFaucet = useCallback(
    async (coin: string) => {
      setLoading(coin);
      await requestFaucet(coin, '10');
      setLoading('');
    },
    [requestFaucet]
  );

  const renderTokenList = useMemo(() => {
    if (tokenStores && tokenInfos) {
      console.log(tokenInfos);
      return availabeTokenSymbols.map((symbol) => {
        const store = tokenStores[symbol];
        const tokenInfo = tokenInfos[symbol];
        return (
          <div className="py-2 px-3.5 flex bg-grey-100 justify-between h-[56px]" key={symbol}>
            <div className="flex gap-3 justify-center items-center">
              <CoinIcon logoSrc={tokenInfo.logo_url.str()} />
              <div className="font-bold text-grey-900">{tokenInfo.name.str()}</div>
            </div>
            <div className="flex gap-4 justify-center items-center">
              <small className="text-grey-700 font-bold uppercase">
                {`${
                  store
                    ? store.coin.value.toJsNumber() / Math.pow(10, tokenInfo.decimals.toJsNumber())
                    : 0
                } 
                  ${symbol}`}{' '}
              </small>
              <Button
                variant="list"
                isLoading={loading === symbol}
                className="px-3.5 py-1"
                onClick={() => onRequestFaucet(symbol)}>
                Faucet
              </Button>
            </div>
          </div>
        );
      });
    }
  }, [tokenInfos, tokenStores, loading, onRequestFaucet]);

  return (
    <div className="overflow-y-scroll no-scrollbar pt-6">
      <div className="flex flex-col gap-4">{renderTokenList}</div>
    </div>
  );
};

export default Faucet;
