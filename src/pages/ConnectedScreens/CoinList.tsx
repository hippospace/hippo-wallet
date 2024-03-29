import CoinIcon from 'components/CoinIcon';
import useHippoClient from 'hooks/useHippoClient';
import { useMemo } from 'react';

const CoinList: React.FC = () => {
  const { tokenStores, tokenInfos } = useHippoClient();

  const renderTokenList = useMemo(() => {
    if (tokenStores && tokenInfos) {
      return Object.keys(tokenStores).map((symbol) => {
        const store = tokenStores[symbol];
        const tokenInfo = tokenInfos[symbol];
        return (
          <div
            className="py-2 px-3.5 flex bg-grey-100 justify-between h-[56px] coinItem"
            key={symbol}>
            <div className="flex gap-3 justify-center items-center">
              <CoinIcon logoSrc={tokenInfo.logo_url.str()} />
              <div className="flex flex-col">
                <div className="font-bold text-grey-900 text-xl">{tokenInfo.name.str()}</div>
                <small className="font-bold text-grey-500">{tokenInfo.symbol.str()}</small>
              </div>
            </div>
            <h6 className="font-bold text-grey-900 leading-10">
              {store.coin.value.toJsNumber() / Math.pow(10, tokenInfo.decimals.toJsNumber())}
            </h6>
          </div>
        );
      });
    }
  }, [tokenInfos, tokenStores]);

  return (
    <div className="overflow-y-scroll no-scrollbar pt-6">
      <div className="flex flex-col gap-4">{renderTokenList}</div>
    </div>
  );
};

export default CoinList;
