import { Menu, MenuProps } from 'components/Antd';
import useAptosWallet from 'hooks/useAptosWallet';
import { useCallback, useMemo } from 'react';
import { CheckIcon, PlusSMIcon } from 'resources/icons';
import { walletAddressEllipsis } from 'utils/utility';
import styles from './WalletList.module.scss';
interface TProps {
  onSelect: () => void;
  onAddNew: () => void;
}

const WalletList: React.FC<TProps> = ({ onSelect, onAddNew }) => {
  const { aptosWalletAccounts, setActiveAptosWallet, activeWallet } = useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();

  const optionLabel = useCallback(
    (walletName: string, address: string) => {
      return (
        <div className="flex justify-between">
          <div className="title w-[88px] truncate font-bold text-grey-900">{walletName}</div>
          <div className="title font-bold text-grey-500">
            ({walletAddressEllipsis(address || '')})
          </div>
          <span>
            {address === privateKeyObject?.address ? <CheckIcon /> : <div className="w-6 block" />}
          </span>
        </div>
      );
    },
    [privateKeyObject]
  );

  const items: MenuProps['items'] = useMemo(() => {
    const walletOptions = aptosWalletAccounts.map(({ walletName, address }) => ({
      label: optionLabel(walletName, address || ''),
      key: address || '',
      onClick: async () => {
        await setActiveAptosWallet(address);
        onSelect();
      }
    }));
    return [
      ...walletOptions,
      {
        label: (
          <div className="flex justify-between items-center">
            <div className="title font-bold text-grey-900">Add/Connect wallet</div>
            <PlusSMIcon />
          </div>
        ),
        key: 'addNewWallet',
        onClick: () => {
          onAddNew();
        }
      }
    ];
  }, [optionLabel, setActiveAptosWallet, aptosWalletAccounts, onSelect, onAddNew]);

  return (
    <div className="flex flex-col gap-4">
      <Menu
        theme="dark"
        className={styles.menu}
        mode="inline"
        items={items}
        selectedKeys={[privateKeyObject?.address || '']}
      />
    </div>
  );
};

export default WalletList;
