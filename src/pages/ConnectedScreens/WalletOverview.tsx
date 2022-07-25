import useAptosWallet from 'hooks/useAptosWallet';
import { useMemo, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyIcon, SwapIcon } from 'resources/icons';

interface TProps {
  onShowWalletList: () => void;
}

const WalletOverview: React.FC<TProps> = ({ onShowWalletList }) => {
  const { activeWallet, aptosWalletAccounts } = useAptosWallet();
  // console.log(`activeWallet: ${JSON.stringify(activeWallet)}`);
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();
  const credentials = useMemo(
    () => [
      {
        key: 'address',
        label: 'Address',
        text: privateKeyObject?.address || ''
      }
    ],
    [privateKeyObject]
  );
  const walletName = useMemo(() => {
    return aptosWalletAccounts.find((account) => account.address === activeWallet?.address)
      ?.walletName;
  }, [aptosWalletAccounts, activeWallet]);
  const [copied, setCopied] = useState(credentials.map((c) => ({ [c.key]: false })));

  const handleOnClickCopy = (key: string) => {
    setCopied((prevState) => ({
      ...prevState,
      [key]: true
    }));
    setTimeout(
      () =>
        setCopied((prevState) => ({
          ...prevState,
          [key]: false
        })),
      2000
    );
  };

  return (
    <div className="flex py-4 px-6 h-[64px] border-b-2 border-grey-100 items-center justify-between">
      <SwapIcon className="rotate-90 cursor-pointer" onClick={onShowWalletList} />
      <div className="flex flex-row gap-1 items-baseline">
        <div className="flex gap-2 items-center">
          <h3 className="text-grey-100 text-2xl font-bold">{walletName}</h3>
        </div>
        {credentials.map(({ text, key }) => (
          <div className="flex gap-2 justify-between" key={key}>
            <CopyToClipboard text={text} onCopy={() => handleOnClickCopy(key)}>
              {copied[key as any] ? (
                <small className="text-green-500">Copied!</small>
              ) : (
                <div className="title text-grey-300 cursor-pointer flex gap-1">
                  <div className="text-[14px]">({text.slice(0, 3) + '...' + text.slice(-3)})</div>
                  <CopyIcon />
                </div>
              )}
            </CopyToClipboard>
          </div>
        ))}
      </div>
      <div className="w-6 h-6 block" />
    </div>
  );
};

export default WalletOverview;
