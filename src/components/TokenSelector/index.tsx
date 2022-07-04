import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/coin_registry/coin_registry';
import ActionSheet from 'components/ActionSheet';
import CoinIcon from 'components/CoinIcon';
import TokenLabel from 'components/TokenLabel';
import TokenListRow from 'components/TokenAmountRow';
import useHippoClient from 'hooks/useHippoClient';
import { FC, useCallback, useState } from 'react';
import { CaretIcon } from 'resources/icons';
import useAvailabeTokenSymbols from 'hooks/useAvailabeTokenSymbols';

export interface TokenSelectorProps {
  currentToken?: TokenInfo;
  excludeTokens?: TokenInfo[];
  onTokenSelected: (ti: TokenInfo) => void;
}

const TokenSelector: FC<TokenSelectorProps> = ({
  currentToken,
  excludeTokens = [],
  onTokenSelected = () => {}
}) => {
  const { tokenInfos } = useHippoClient();

  const [tokenListVisible, setTokenListVisible] = useState(false);

  const presetTokens = ['BTC', 'USDC', 'USDT'];

  const [availableTokenSymbols] = useAvailabeTokenSymbols();
  const [filteredTokens, setFilteredTokens] = useState(availableTokenSymbols);

  const onTokenListRowClick = useCallback(
    (ti: TokenInfo) => {
      onTokenSelected(ti);
      setTokenListVisible(false);
    },
    [onTokenSelected]
  );

  const onSelect = useCallback(() => {
    setTokenListVisible(true);
  }, []);

  return (
    <>
      <div className="flex items-center cursor-pointer" onClick={onSelect}>
        <TokenLabel token={currentToken} />
        <CaretIcon className="font-icon ml-1 text-[8px]" />
      </div>
      <ActionSheet
        visible={!!tokenListVisible && !!tokenInfos}
        mode={'fullTab'}
        title={
          <div className="w-full bg-white">
            <div className="flex mb-2">
              {presetTokens.map((s) => {
                const token = tokenInfos && tokenInfos[s];
                return (
                  token && (
                    <CoinIcon
                      key={`coin-icon-${s}`}
                      className="mr-2 last:mr-0"
                      logoSrc={token.logo_url.str()}
                      onClick={() => onTokenListRowClick(token)}
                    />
                  )
                );
              })}
            </div>
            <div>
              {/* TODO: add clear button */}
              <input
                className="border-2 w-full rounded-lg px-2 h-9 text-grey-900 largeText bold focus:outline-none"
                type={'text'}
                placeholder="Search..."
                onChange={(e) => {
                  const text = e.target.value;
                  if (tokenInfos) {
                    setFilteredTokens(
                      availableTokenSymbols.filter((t) => new RegExp(text, 'i').test(t))
                    );
                  }
                }}
              />
            </div>
          </div>
        }
        onClose={() => setTokenListVisible(false)}>
        <div>
          {filteredTokens &&
            filteredTokens
              .filter((ts) => !excludeTokens.map((t) => t.symbol.str()).includes(ts))
              .map((ts) => {
                const ti = tokenInfos && tokenInfos[ts];
                return (
                  ti && (
                    <TokenListRow
                      className="mb-2 rounded-md last:mb-0"
                      key={ti.symbol.str()}
                      token={ti}
                      onClick={() => onTokenListRowClick(ti)}
                    />
                  )
                );
              })}
        </div>
      </ActionSheet>
    </>
  );
};

export default TokenSelector;
