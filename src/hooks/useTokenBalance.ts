import { useMemo } from 'react';
import useHippoClient from './useHippoClient';

const useTokenBalane = (tokenSymbol: string | undefined) => {
  const { tokenInfos, tokenStores } = useHippoClient();

  const inputTokenBalance = useMemo(() => {
    if (!tokenSymbol) return 0;
    if (tokenInfos && tokenStores) {
      const inputToken = tokenInfos[tokenSymbol];
      const tokenStore = tokenStores[inputToken.symbol];
      return tokenStore && inputToken
        ? tokenStore.coin.value.toJSNumber() / Math.pow(10, inputToken.decimals)
        : 0;
    } else {
      return 0;
    }
  }, [tokenInfos, tokenStores, tokenSymbol]);

  return [inputTokenBalance];
};

export default useTokenBalane;
