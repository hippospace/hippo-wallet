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
  const { aptosWalletAccounts, setActiveAptosWallet, activeWallet, deleteAccount } =
    useAptosWallet();
  const privateKeyObject = activeWallet?.aptosAccount?.toPrivateKeyObject();

  const optionLabel = useCallback(
    (walletName: string, address: string, deleted = false) => {
      return (
        <div className="flex flex-col">
          <div className="flex justify-between">
            <div
              className={`title w-[88px] truncate font-bold text-grey-900 ${
                deleted ? 'line-through' : ''
              }`}>
              {walletName}
            </div>
            <div className="title font-bold text-grey-500">
              ({walletAddressEllipsis(address || '')})
            </div>
            <span>
              {address === privateKeyObject?.address ? (
                <CheckIcon />
              ) : (
                <div className="w-6 block" />
              )}
            </span>
          </div>
          {deleted && (
            <div className="flex justify-between">
              <small className="text-red-600">Account is removed in devent</small>
              <small
                className="underline text-red-600 cursor-pointer"
                onClick={async (e: React.MouseEvent<HTMLElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await deleteAccount(address);
                  onSelect();
                }}>
                Delete
              </small>
            </div>
          )}
        </div>
      );
    },
    [deleteAccount, onSelect, privateKeyObject?.address]
  );

  const items: MenuProps['items'] = useMemo(() => {
    const walletOptions = aptosWalletAccounts.map(({ walletName, address, isAccountRemoved }) => ({
      label: optionLabel(walletName, address || '', isAccountRemoved),
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
