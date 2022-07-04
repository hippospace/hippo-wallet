import { u8str } from 'utils/hippoWalletUtil';
import useHippoClient from './useHippoClient';

const useAvailabeTokenSymbols = () => {
  const { tokenInfos } = useHippoClient();
  if (!tokenInfos) return [];

  return [
    Object.keys(tokenInfos).filter((symbol) => {
      return (
        u8str(tokenInfos[symbol].token_type.module_name).startsWith('mock_coin') ||
        symbol === 'APTOS'
      );
    })
  ];
};

export default useAvailabeTokenSymbols;
