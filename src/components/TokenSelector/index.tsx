import { TokenInfo } from '@manahippo/hippo-sdk/dist/generated/X0xf70ac33c984f8b7bead655ad239d246f1c0e3ca55fe0b8bfc119aa529c4630e8/TokenRegistry';
import ActionSheet from 'components/ActionSheet';
import CoinIcon from 'components/CoinIcon';
import TokenLabel from 'components/TokenLabel';
import TokenListRow from 'components/TokenAmountRow';
import useHippoClient from 'hooks/useHippoClient';
import { FC, useCallback, useState } from 'react';
import { CaretIcon } from 'resources/icons';

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
  const [filteredTokens, setFilteredTokens] = useState(tokenInfos && Object.values(tokenInfos));

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
        <CaretIcon className="fill-black ml-1" />
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
                      logoSrc={token.logo_url}
                      onClick={() => onTokenListRowClick(token)}
                    />
                  )
                );
              })}
            </div>
            <div>
              {/* TODO: add clear button */}
              <input
                className="border-2 w-full rounded-lg px-2 h-10"
                type={'text'}
                placeholder="Search..."
                onChange={(e) => {
                  const text = e.target.value;
                  if (tokenInfos) {
                    setFilteredTokens(
                      Object.values(tokenInfos).filter((t) => new RegExp(text, 'i').test(t.symbol))
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
              .filter(
                (ti) =>
                  !excludeTokens.map((t) => t.symbol).includes(ti.symbol) &&
                  (ti.token_type.module_name.toString().startsWith('MockCoin') ||
                    ti.symbol === 'APTOS')
              )
              .map((ti) => {
                return (
                  <TokenListRow
                    className="mb-2 rounded-md last:mb-0"
                    key={ti.symbol}
                    token={ti}
                    onClick={() => onTokenListRowClick(ti)}
                  />
                );
              })}
        </div>
      </ActionSheet>
    </>
  );
};

export default TokenSelector;
